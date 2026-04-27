# MBV Knowledge Check — Project Memory
_Last updated: 24 April 2026_

---

## What This Project Is
An 8-week post-training knowledge retention quiz for Mercedes-Benz Vans (MBV) Product & Competition programme. Built from a PowerPoint proposal. Kahoot-style UI, dark theme, MB van images, confetti. Collects responses to Google Sheets. Admin dashboard for gap analysis.

---

## Live URLs
- **Quiz:** https://mb-home-mbv-knowledge-check.pages.mercedes-benz.ghe.com/quiz/
- **Admin Dashboard:** https://mb-home-mbv-knowledge-check.pages.mercedes-benz.ghe.com/admin/dashboard.html
- **GHE Repo:** https://mercedes-benz.ghe.com/mb-home/mbv-knowledge-check

---

## Key Infrastructure

| What | Detail |
|------|--------|
| Hosting | GitHub Pages on `mercedes-benz.ghe.com`, org `mb-home`, repo `mbv-knowledge-check`, branch `main` |
| Google Sheets webhook | `https://script.google.com/macros/s/AKfycbzV0YTUEFU0bqaNqF_Uy-usj52moJl1xlywveL-IlDhQKKkyFP67GtJVb524KPn5ZuP/exec` |
| Google Sheets CSV | `https://docs.google.com/spreadsheets/d/e/2PACX-1vR8UHtnongivkhDLYIHpXSe5Wx8HpzhQGkj1iltSKyQe6eB-BxpK7TU6P6ae96oSFcITiCBTf1c0QOf/pub?gid=133078932&single=true&output=csv` |
| MB Media CDN pattern | `https://api.media.mercedes-benz.com/jsonapi/image/deliver/{UUID}/1024` |
| Local preview | `python3 -m http.server 8000` → http://localhost:8000/quiz/ |
| Git push auth | PAT with SAML SSO authorised on GHE settings page |

---

## File Structure
```
├── quiz/
│   ├── index.html          ← Main quiz (Kahoot-style, dark theme, confetti)
│   └── questions.json      ← All questions, answers, image URLs — edit per cohort
├── admin/
│   └── dashboard.html      ← Live response tracker, reads Google Sheets CSV
├── email/
│   └── template.html       ← Mail-merge HTML email (placeholders below)
├── serve.py                ← Local Python server helper
├── README.md               ← Full project docs on GHE
└── claude.md               ← This file
```

---

## Quiz Architecture
- **Vanilla HTML/CSS/JS** — no frameworks, single-file quiz
- **Two stages:**
  - Stage 1: 7 MCQ questions (with MB van images, Kahoot-style coloured answer blocks)
  - Stage 2: 5 open-ended + 1 MCQ
- **Flow:** Welcome → Name/Email/MA → Stage 1 intro → Q1–7 → Stage 2 intro → Q8–13 → Thank you
- **Submission:** `no-cors` POST to Google Apps Script, `Content-Type: text/plain`, body is `JSON.stringify(response)`
- **Backup:** Also saves to `localStorage` key `mbv_kc_responses`
- **Confetti:** Pure canvas animation — fires on correct MCQ answer + completion screen

---

## questions.json Structure
```json
{
  "cohort": "Cohort 1 — January 2026",
  "training_date": "January 2026",
  "check_date": "March 2026",
  "stage1": {
    "label": "Stage 1",
    "description": "...",
    "questions": [
      {
        "id": "s1q1",
        "type": "mcq",
        "text": "Question text",
        "image": "https://api.media.mercedes-benz.com/jsonapi/image/deliver/{UUID}/1024",
        "options": ["A", "B", "C", "D"],
        "correct": 0
      }
    ]
  },
  "stage2": { ... }
}
```
- `correct` is 0-indexed (0 = first option)
- `image` field is optional — falls back to 🚐 emoji if missing
- To update for a new cohort: change `cohort`, `training_date`, `check_date`, and optionally shuffle/replace questions

---

## MB Van Image UUIDs Used
| UUID | Description |
|------|-------------|
| `13b1f674-...` | VanSolution group shot |
| `71d18745-...` | VLE front 3/4 view |
| `5fa62c6c-...` | VLE side profile |
| `1211b0ca-...` | VLE dark studio |
| `4044a879-...` | VLE studio light |

Full UUIDs are in `quiz/questions.json` image fields.

---

## Admin Dashboard
- Fetches Google Sheets published CSV on load
- Parses column headers: `[MCQ] Question text` and `[OPEN] Question text`
- Shows: response count, MCQ accuracy per question (gap analysis bars), sortable table, per-participant modal with correct/incorrect highlighting, CSV export
- **To open Google Sheet directly:** button in dashboard header

---

## Email Template Placeholders
```
{{FIRST_NAME}}      — recipient's first name
{{TRAINING_DATE}}   — e.g. "January 2026"
{{QUIZ_LINK}}       — https://mb-home-mbv-knowledge-check.pages.mercedes-benz.ghe.com/quiz/
{{COHORT}}          — e.g. "Cohort 1"
```

---

## Key Technical Fixes Made (for reference)
- **SAML SSO push blocked:** PAT needs "Configure SSO → Authorise" on GHE PAT settings page
- **Google Sheets blank after submit:** Must use `mode: 'no-cors'` + `Content-Type: text/plain` (not `application/json`)
- **Admin showing "Option 2 selected":** Fixed by loading `questions.json` and looking up real option text
- **Large git push HTTP 400:** Fixed with `git config http.postBuffer 524288000`

---

## Proposal Timeline (from original PowerPoint)
| Milestone | Date |
|-----------|------|
| Option confirmation | 27 April 2026 ✅ |
| Pilot group collation | 4 May 2026 |
| MBVTC contact | 11 May 2026 |
| Knowledge check creation | 27 May – 20 July 2026 |

---

## Remaining / Next Steps
- [ ] Confirm pilot group list (4 May)
- [ ] Contact MBVTC (11 May)
- [ ] Update `questions.json` with cohort-specific data per the timeline
- [ ] Send email to pilot group using `email/template.html` with live quiz URL filled in
- [ ] Monitor responses via admin dashboard
- [ ] Note: MB media CDN images may not load without MB network auth — test on MB device
