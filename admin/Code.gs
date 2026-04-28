// ============================================================
//  MBV Knowledge Check – Google Apps Script
//  Paste this entire file into your Apps Script editor,
//  replacing all existing code, then redeploy as a Web App.
// ============================================================

const SHEET_NAME = 'Responses';
const MCQ_IDS    = ['s1q1','s1q2','s1q3','s1q4','s1q5','s1q6','s1q7','s2q5'];
const MCQ_ANSWERS = {
  s1q1: 1,
  s1q2: 2,
  s1q3: 1,
  s1q4: 1,
  s1q5: 0,
  s1q6: 1,
  s1q7: 1,
  s2q5: 1
};
const MCQ_TOTAL = MCQ_IDS.length; // 8

// ── POST: receive quiz submission ──────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let sheet   = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'ID','Timestamp','Cohort','Training Date',
        'Name','Email','Dealer',
        'MCQ Score','MCQ %',
        ...MCQ_IDS.map(id => `Q_${id}`)
      ]);
    }

    const answers = data.answers || {};
    let score = 0;
    MCQ_IDS.forEach(id => {
      if (parseInt(answers[id]) === MCQ_ANSWERS[id]) score++;
    });

    const pct = Math.round((score / MCQ_TOTAL) * 100);
    const p   = data.participant || {};

    sheet.appendRow([
      data.id,
      data.timestamp,
      data.cohort,
      data.training_date,
      p.name  || '',
      p.email || '',
      p.dealer || p.ma || '',
      score,
      pct,
      ...MCQ_IDS.map(id => answers[id] !== undefined ? answers[id] : '')
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET: return leaderboard data ───────────────────────────
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || '';

    if (action !== 'leaderboard') {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ cohort: '', entries: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows   = sheet.getDataRange().getValues();
    const header = rows[0];
    const data   = rows.slice(1);

    // column indices
    const iId        = header.indexOf('ID');
    const iTimestamp = header.indexOf('Timestamp');
    const iCohort    = header.indexOf('Cohort');
    const iName      = header.indexOf('Name');
    const iEmail     = header.indexOf('Email');
    const iDealer    = header.indexOf('Dealer');
    const iScore     = header.indexOf('MCQ Score');
    const iPct       = header.indexOf('MCQ %');

    // answer column indices for on-the-fly scoring (fallback for old rows)
    const answerCols = {};
    MCQ_IDS.forEach(id => { answerCols[id] = header.indexOf(`Q_${id}`); });

    // Old sheet column order for answers (by position, 0-indexed):
    // Timestamp(0) Name(1) Email(2) MA(3) Cohort(4) TrainingDate(5)
    // then MCQ/OPEN answers in question order:
    // s1q1(6) s1q2(7) s1q3(8) s1q4(9) s1q5(10) s1q6(11) s1q7(12)
    // s2q1-open(13) s2q2-open(14) s2q3-open(15) s2q4-open(16) s2q5(17) s2q6-open(18)
    const OLD_MCQ_COLS = { s1q1:6, s1q2:7, s1q3:8, s1q4:9, s1q5:10, s1q6:11, s1q7:12, s2q5:17 };

    function calcScore(row) {
      // New format: use stored MCQ Score column
      if (iScore !== -1 && row[iScore] !== '' && row[iScore] !== null && !isNaN(Number(row[iScore]))) {
        return { score: Number(row[iScore]), pct: Number(row[iPct]) };
      }
      // New format fallback: Q_ named columns
      let foundQCols = MCQ_IDS.some(id => answerCols[id] !== -1);
      if (foundQCols) {
        let s = 0;
        MCQ_IDS.forEach(id => {
          const col = answerCols[id];
          if (col !== -1 && parseInt(row[col]) === MCQ_ANSWERS[id]) s++;
        });
        return { score: s, pct: Math.round((s / MCQ_TOTAL) * 100) };
      }
      // Old format fallback: answers by fixed column position
      let s = 0;
      MCQ_IDS.forEach(id => {
        const col = OLD_MCQ_COLS[id];
        if (col !== undefined && parseInt(row[col]) === MCQ_ANSWERS[id]) s++;
      });
      return { score: s, pct: Math.round((s / MCQ_TOTAL) * 100) };
    }

    // deduplicate by email — keep highest score, then earliest timestamp
    const map = {};
    data.forEach(row => {
      // support both old format (Timestamp,Name,Email,MA,...) and new format
      const email   = iEmail  !== -1 ? row[iEmail]  : row[2];
      const name    = iName   !== -1 ? row[iName]   : row[1];
      const dealer  = iDealer !== -1 ? row[iDealer] : row[3];
      const ts_raw  = iTimestamp !== -1 ? row[iTimestamp] : row[0];
      const cohort_val = iCohort !== -1 ? row[iCohort] : row[4];
      if (!email) return;
      const existing = map[email];
      const { score, pct } = calcScore(row);
      const ts = new Date(ts_raw);
      if (!existing || score > existing.score || (score === existing.score && ts < new Date(existing.timestamp))) {
        map[email] = {
          timestamp: ts_raw,
          cohort:    cohort_val,
          name:      name,
          email:     email,
          dealer:    dealer,
          score:     score,
          pct:       pct
        };
      }
    });

    const entries = Object.values(map);
    const cohort  = entries.length ? entries[0].cohort : '';

    return ContentService
      .createTextOutput(JSON.stringify({ cohort, entries }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
