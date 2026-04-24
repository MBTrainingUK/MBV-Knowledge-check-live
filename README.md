# MBV Knowledge Check

> **Internal · Mercedes-Benz Vans UK · Training & Competence**

An 8-week post-training knowledge retention tool for the MBV Product & Competition programme. Participants complete a two-stage quiz 8 weeks after attending training. Responses are collected centrally and used to identify knowledge gaps and improve future programme design.

---

## 🔗 Live Links

| Page | URL |
|---|---|
| **Quiz** | `https://mb-home-mbv-knowledge-check.pages.mercedes-benz.ghe.com/quiz/` |
| **Admin Dashboard** | `https://mb-home-mbv-knowledge-check.pages.mercedes-benz.ghe.com/admin/dashboard.html` |
| **Email Template** | `https://mb-home-mbv-knowledge-check.pages.mercedes-benz.ghe.com/email/template.html` |

---

## 📁 Project Structure

```
quiz/
  index.html        — Two-stage interactive quiz (MCQ + open-ended)
  questions.json    — All questions, options and correct answers (edit per cohort)

email/
  template.html     — Branded mail-merge HTML email template

admin/
  dashboard.html    — Response tracker, gap analysis and CSV export

serve.py            — Local preview server (development only)
```

---

## 🔄 How It Works

```
1. Participant receives branded email with CTA link
           ↓
2. Clicks through to the quiz (GitHub Pages)
           ↓
3. Completes Stage 1 (7 MCQ confidence-builder questions)
           ↓
4. Completes Stage 2 (open-ended + 1 applied MCQ)
           ↓
5. Response POSTed to Google Apps Script webhook
           ↓
6. Row written to Google Sheet (central response database)
           ↓
7. Admin dashboard reads from Sheet CSV — live data, no login needed
```

---

## 📋 The Pilot

- **Target group:** Delegates who completed the MBV Product & Competition training
- **Timing:** Knowledge check sent 8 weeks after training
- **Cohort size:** Max 30 participants per cohort
- **Cadence:** Repeats every 8 weeks with a new cohort
- **Incentive:** Prize draw entry on full completion
- **Purpose:** Diagnostic only — no pass/fail scores, results not shared with line managers

### Cohort Timeline

| Cohort | Training Date | Knowledge Check Date |
|---|---|---|
| Cohort 1 | 26/27 May 2026 | 22 July 2026 |
| Cohort 2 | 14/15 Jul 2026 | 9 Sep 2026 |
| Cohort 3 | 08/09 Oct 2026 | 04 Dec 2026 |

---

## ✏️ Updating Questions (Per Cohort)

All questions live in [`quiz/questions.json`](quiz/questions.json). Edit this file before each cohort:

```json
{
  "cohort": "Cohort 2 – July 2026",
  "training_date": "14/15 July 2026",
  "check_date": "9 September 2026",
  "stage1": { ... },
  "stage2": { ... }
}
```

**Question types:**
- `"type": "mcq"` — multiple choice, set `"correct"` to the index of the right answer (0 = first option)
- `"type": "open"` — free text, no correct answer needed

After editing, deploy with:

```bash
git add quiz/questions.json
git commit -m "update: questions for cohort 2"
git push
```

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Quiz & Dashboard | Vanilla HTML / CSS / JavaScript (no frameworks) |
| Hosting | GitHub Pages (mercedes-benz.ghe.com) |
| Response storage | Google Sheets via Apps Script webhook |
| Email | HTML mail-merge template |
| Version control | GitHub Enterprise (mb-home org) |

---

## 🚀 Local Development

Requires Python 3 (pre-installed on macOS).

```bash
python3 serve.py
```

Opens automatically at `http://localhost:8000/quiz/`

| Page | Local URL |
|---|---|
| Quiz | `http://localhost:8000/quiz/` |
| Dashboard | `http://localhost:8000/admin/dashboard.html` |
| Email | `http://localhost:8000/email/template.html` |

---

## 📧 Email Template

The email template at [`email/template.html`](email/template.html) is designed for mail merge. Replace these placeholders before sending:

| Placeholder | Replace with |
|---|---|
| `{{FIRST_NAME}}` | Recipient's first name |
| `{{TRAINING_DATE}}` | Their training date e.g. `26/27 May 2026` |
| `{{QUIZ_LINK}}` | `https://mb-home-mbv-knowledge-check.pages.mercedes-benz.ghe.com/quiz/` |
| `{{COHORT}}` | Cohort label e.g. `Cohort 1 – May 2026` |

---

## 📊 Admin Dashboard

The dashboard at [`admin/dashboard.html`](admin/dashboard.html) reads live from the Google Sheet and shows:

- Total responses and completion rate
- MCQ correct rate across all participants
- Knowledge gap analysis bar chart (per question)
- Searchable, sortable individual response table
- Per-participant modal with full answer view (correct/incorrect highlighted)
- CSV export button

---

## 👥 Contacts

| Role | Person |
|---|---|
| Project lead | Jacob V / Hannah L |
| T&C team | LC / WC |
| Van Training Champions | Per MA |

---

## 📄 Licence

Internal use only · Mercedes-Benz Vans UK · Not for external distribution
