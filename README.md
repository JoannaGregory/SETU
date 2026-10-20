# SETU (சேது) — Education & Scholarship Enablement Engine

> **Bridging Rural and Low-Income Students to Every Scholarship They Deserve**  
> Built for the **TEJAS 2026 Hackathon & Codeathon Grand Finale** (SASTRA / Temenos) • **Team TEJAS022**

---

## 🌟 Overview & Problem Statement

Scholarships, fee waivers, and book grants exist across Tamil Nadu and National ministries, yet underprivileged families often miss out because of:
1. **Fragmented & Bureaucratic Information:** Scattered across dozens of portal links.
2. **Language & Interface Barriers:** Complex English portals rather than accessible Tamil speech.
3. **Application Drop-off:** Students get stuck on one missing document (e.g., Tahsildar income certificate or bank NPCI Aadhaar seeding) and abandon their application before the deadline.

**SETU** ("Bridge") solves this with an end-to-end **4-Agent Architecture**:
- 🎙️ **Intake Agent:** Bilingual (Tamil & English) voice and keypad-style intake that extracts education level, income band, community category, and state domicile without jargon.
- ⚖️ **Eligibility Agent:** Pure deterministic rules engine in Python (Zero hallucination). Evaluates active government schemes in SQLite.
- 📑 **Application Agent:** Transforms complex government requirements into an interactive document checklist, step-by-step submission steps, and official portal links.
- ⏰ **Follow-up Agent & Teacher Escalation:** Detects applications inactive for >5 days, triggers automated reminders, and flags urgent intervention alerts on the Teacher/Mentor Dashboard.

---

## 🚀 Live Demo Quickstart

### Option 1: Single-Command All-in-One Launch (Recommended)
Double-click `run_all.bat` or run in terminal:
```bash
cd backend
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser to: **[http://localhost:8000](http://localhost:8000)**

### Option 2: Frontend Development with Hot Reload (Vite)
Terminal 1 (Backend):
```bash
cd backend
.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** (proxies `/api` calls directly to port 8000).

---

## 🏗️ Project Architecture

```
setu/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI Orchestrator & Static SPA server
│   │   ├── models.py            # Pydantic data schemas
│   │   ├── database.py          # SQLite database connection & migrations
│   │   ├── seed_data.py         # Real verified TN & Central Government scholarships
│   │   └── agents/
│   │       ├── intake_agent.py      # Voice/chat intake & profile validation
│   │       ├── eligibility_agent.py # Deterministic Python rules engine
│   │       ├── application_agent.py # Document checklist & guidance generator
│   │       └── followup_agent.py    # Stuck detection & teacher escalation
│   ├── tests/
│   │   ├── test_eligibility.py  # 100% deterministic rules unit tests
│   │   ├── test_intake.py       # Conversational parsing tests
│   │   └── test_api.py          # FastAPI endpoint integration tests
│   ├── setu.db                  # Local SQLite database
│   └── run_backend.py           # Backend startup script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation bar & language switcher
│   │   │   ├── Footer.jsx               # SDG 4 & privacy declaration
│   │   │   ├── Home.jsx                 # Impact hero & scheme highlight
│   │   │   ├── ChatIntake.jsx           # Voice & conversational intake assistant
│   │   │   ├── SchemeCards.jsx          # Matched schemes with condition breakdown
│   │   │   ├── ApplicationTracker.jsx   # Document checklist & progress bar
│   │   │   ├── TeacherDashboard.jsx     # Teacher alerts & 5-day demo trigger
│   │   │   └── SchemeAdmin.jsx          # Freshness audit & scheme approval
│   │   ├── i18n.js              # Comprehensive English & Tamil dictionaries
│   │   ├── api.js               # API service layer with fallbacks
│   │   ├── index.css            # Clean, high-contrast accessible design
│   │   ├── App.jsx              # Main tab controller
│   │   └── main.jsx
│   ├── public/
│   │   └── logo.svg             # Custom SETU brand icon
│   └── dist/                    # Compiled production build
├── run_all.bat                  # One-click Windows launcher
└── README.md
```

---

## 🏛️ Real Verified Government Schemes Seeded

1. **Pudhumai Penn Scheme (Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme)**
   - *Target:* Girl students from TN government schools entering College/Diploma.
   - *Benefit:* ₹1,000 / month directly into bank account until course completion.
2. **Tamil Nadu Post-Matric Scholarship (BC / MBC / DNC Welfare)**
   - *Target:* Backward Classes students in Classes 11, 12, ITI, Diploma, and Degree courses.
   - *Benefit:* 100% tuition fee waiver + examination fees + maintenance allowance.
3. **Tamil Nadu Post-Matric Scholarship (SC / ST / Converted Christian Welfare)**
   - *Target:* Scheduled Caste and Tribe students with parental income under ₹2.5 Lakhs.
   - *Benefit:* Complete non-refundable compulsory fees + hostel charges.
4. **National Means-cum-Merit Scholarship (NMMS)**
   - *Target:* Meritorious students from economically weaker sections.
   - *Benefit:* ₹12,000 / year (₹1,000 / month) from Class 9 to Class 12.
5. **AICTE Pragati Scholarship for Girl Students**
   - *Target:* Girls admitted to 1st year Degree or Diploma technical courses.
   - *Benefit:* ₹50,000 / year for tuition, books, and equipment.
6. **Central Sector Scheme of Scholarship (CSSS - NSP)**
   - *Target:* Top 80th percentile students in Class 12 pursuing regular higher education.
   - *Benefit:* ₹12,000/yr for graduation, ₹20,000/yr for post-graduation.
7. **Tamil Nadu CM Uzhavar Pathukappu Thittam (Farmers' Child Educational Aid)**
   - *Target:* Children of registered small/marginal farmers and agricultural laborers.
   - *Benefit:* ₹1,750 – ₹6,000 annual education grant + hostel support.

---

## 🏆 Presentation Highlights for Hackathon Judges

1. **"LLM handles language, Python decides, Database remembers":**  
   The LLM extracts user fields from voice/text, but **never** makes up eligibility. All matching decisions are 100% deterministic, audit-logged, and cite verified government URLs.
2. **Interactive 5-Day Fast-Forward Demo (`/api/demo/skip_days`):**  
   Judges can click the **"Fast-Forward 5 Days"** button on the Teacher Dashboard to watch the Follow-up Agent detect stalled cases and trigger escalation in real-time.
3. **Freshness & Stale Rule in SQLite:**  
   Schemes not verified within 90 days are automatically marked `STALE` and excluded from student recommendations to prevent outdated guidelines from reaching vulnerable families.
4. **Bilingual by Design:**  
   Instant toggle between English and தமிழ் across all views, including Web Speech API voice synthesis and recognition.

---

## 🧪 Unit & Integration Tests

All 10 tests pass with 100% success:
```bash
cd backend
$env:PYTHONPATH="."
.venv\Scripts\python -m pytest tests -v
```
- `test_pudhumai_penn_girl_student`: Verifies girl students match Pudhumai Penn.
- `test_pudhumai_penn_boy_ineligible`: Verifies male applicants are rejected for girl-only schemes.
- `test_post_matric_bc_income_cutoff`: Verifies exact income threshold logic (₹2,50,000 limit).
- `test_parse_income`: Tests natural language parsing ("1.5 lakhs", "80k", "below 1 lakh").
- `test_intake_flow_step_by_step`: Tests complete multi-turn conversation flow.
- `test_health_check`, `test_intake_api`, `test_eligibility_match_api`, `test_demo_skip_days`: Integration tests with FastAPI test client.
