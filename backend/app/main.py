import json
import sqlite3
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any, List

from .database import init_db, get_db
from .models import StudentProfile, IntakeRequest, IntakeResponse
from .agents.intake_agent import process_intake_message
from .agents.eligibility_agent import evaluate_eligibility
from .agents.application_agent import get_application_guidance
from .agents.followup_agent import evaluate_followups, fast_forward_days

# Initialize database tables & seed data on startup
init_db()

app = FastAPI(
    title="SETU API - Education & Scholarship Enablement Engine",
    description="Multi-agent platform for rural & low-income student scholarship matching",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite dev server and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "SETU Multi-Agent Backend",
        "team": "TEJAS022",
        "agents": ["IntakeAgent", "EligibilityAgent", "ApplicationAgent", "FollowupAgent"]
    }

# ----------------- INTAKE AGENT -----------------
@app.post("/api/intake")
def intake_endpoint(req: IntakeRequest):
    """
    Intake Agent: extracts education details, language preference, income,
    and returns conversational responses + menu choices.
    """
    result = process_intake_message(
        session_id=req.session_id or "default",
        message=req.message,
        menu_choice=req.menu_choice,
        field_updates=req.field_updates,
        language=req.language
    )
    return result

@app.post("/api/confirm")
def confirm_profile(profile_data: Dict[str, Any]):
    """
    Saves the confirmed student profile to the SQLite database.
    """
    conn = get_db()
    cursor = conn.cursor()
    student_id = profile_data.get("student_id") or f"STU-{int(datetime.now().timestamp())}"
    
    cursor.execute("""
        INSERT OR REPLACE INTO profiles (
            student_id, name, state, completed_class, income, category, gender, course_pursuing, language, confirmed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    """, (
        student_id,
        profile_data.get("name", "Student"),
        profile_data.get("state", "Tamil Nadu"),
        profile_data.get("completed_class", 10),
        profile_data.get("income", 200000),
        profile_data.get("category", "General"),
        profile_data.get("gender", "any"),
        profile_data.get("course_pursuing", ""),
        profile_data.get("language", "en")
    ))
    conn.commit()
    conn.close()

    return {"status": "confirmed", "student_id": student_id, "profile": profile_data}

# ----------------- ELIGIBILITY AGENT -----------------
@app.post("/api/match")
@app.post("/api/eligibility")
def match_schemes_endpoint(profile: Dict[str, Any]):
    """
    Eligibility Agent: runs deterministic Python rules against active SQLite schemes.
    Returns matched schemes with verifiable criteria and official URLs.
    """
    matches = evaluate_eligibility(profile)
    return {
        "profile": profile,
        "total_schemes": len(matches),
        "eligible_count": sum(1 for m in matches if m["eligible"]),
        "schemes": matches
    }

# ----------------- APPLICATION AGENT -----------------
@app.get("/api/schemes")
def list_schemes(state: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if state and state.upper() != "ALL":
        cursor.execute("SELECT * FROM schemes WHERE status = 'ACTIVE' AND (state = ? OR state = 'ALL')", (state,))
    else:
        cursor.execute("SELECT * FROM schemes WHERE status = 'ACTIVE'")
    rows = cursor.fetchall()
    conn.close()

    schemes = []
    for r in rows:
        schemes.append({
            "scheme_id": r["scheme_id"],
            "name": r["name"],
            "name_ta": r["name_ta"],
            "state": r["state"],
            "completed_class": r["completed_class"],
            "income_limit": r["income_limit"],
            "categories": r["categories"],
            "gender": r["gender"],
            "benefit_amount": r["benefit_amount"],
            "benefit_amount_ta": r["benefit_amount_ta"],
            "deadline": r["deadline"],
            "documents": json.loads(r["documents"]),
            "apply_steps": json.loads(r["apply_steps"]),
            "official_url": r["official_url"],
            "source_authority": r["source_authority"],
            "last_verified": r["last_verified"],
            "status": r["status"]
        })
    return schemes

@app.get("/api/schemes/{scheme_id}")
def scheme_guidance(scheme_id: str):
    """
    Application Agent: detailed checklist, steps, and source attribution.
    """
    guidance = get_application_guidance(scheme_id)
    if "error" in guidance:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return guidance

# ----------------- CASES & APPLICATION TRACKER -----------------
@app.get("/api/cases")
def list_cases(status: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if status:
        cursor.execute("SELECT * FROM cases WHERE status = ? ORDER BY days_inactive DESC", (status,))
    else:
        cursor.execute("SELECT * FROM cases ORDER BY days_inactive DESC")
    rows = cursor.fetchall()
    conn.close()

    cases = []
    for r in rows:
        cases.append({
            "case_id": r["case_id"],
            "student_name": r["student_name"],
            "phone": r["phone"],
            "state": r["state"],
            "scheme_id": r["scheme_id"],
            "scheme_name": r["scheme_name"],
            "status": r["status"],
            "days_inactive": r["days_inactive"],
            "teacher_alert": bool(r["teacher_alert"]),
            "reminder_sent": bool(r["reminder_sent"]),
            "notes": r["notes"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"]
        })
    return cases

@app.post("/api/cases")
def create_case(data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    case_id = f"CASE-{int(datetime.now().timestamp()) % 100000}"
    today = datetime.now().strftime("%Y-%m-%d")

    cursor.execute("""
        INSERT INTO cases (
            case_id, student_name, phone, state, scheme_id, scheme_name,
            status, days_inactive, teacher_alert, reminder_sent, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'DOCUMENTS_PENDING', 0, 0, 0, ?, ?, ?)
    """, (
        case_id,
        data.get("student_name", "Student"),
        data.get("phone", "+91 98765 43210"),
        data.get("state", "Tamil Nadu"),
        data.get("scheme_id"),
        data.get("scheme_name"),
        data.get("notes", "Application started via SETU portal"),
        today,
        today
    ))
    conn.commit()
    conn.close()

    return {"status": "created", "case_id": case_id}

@app.patch("/api/cases/{case_id}")
def update_case(case_id: str, data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")

    new_status = data.get("status")
    notes = data.get("notes")
    reset_inactivity = data.get("reset_inactivity", True)

    cursor.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Case not found")

    status_val = new_status if new_status else row["status"]
    notes_val = notes if notes else row["notes"]
    days_val = 0 if reset_inactivity else row["days_inactive"]
    alert_val = 0 if status_val in ["APPLIED", "COMPLETED"] else row["teacher_alert"]

    cursor.execute("""
        UPDATE cases
        SET status = ?, notes = ?, days_inactive = ?, teacher_alert = ?, updated_at = ?
        WHERE case_id = ?
    """, (status_val, notes_val, days_val, alert_val, today, case_id))
    conn.commit()
    conn.close()

    return {"status": "updated", "case_id": case_id, "new_status": status_val}

# ----------------- FOLLOW-UP AGENT & DEMO SIMULATION -----------------
@app.post("/api/demo/skip_days")
def skip_days_demo(payload: Optional[Dict[str, int]] = Body(None)):
    """
    Hackathon Demo Trigger: simulates days elapsed (default 5 days).
    Demonstrates the Follow-up Agent flagging stuck applications, sending reminders,
    and alerting the teacher in real-time.
    """
    days = 5
    if payload and "days" in payload:
        days = payload["days"]
    result = fast_forward_days(days)
    return result

# ----------------- ADMIN SCHEME MANAGEMENT -----------------
@app.get("/api/admin/schemes")
def admin_schemes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes ORDER BY status ASC, scheme_id ASC")
    rows = cursor.fetchall()
    conn.close()

    schemes = []
    for r in rows:
        schemes.append({
            "scheme_id": r["scheme_id"],
            "name": r["name"],
            "name_ta": r["name_ta"],
            "state": r["state"],
            "completed_class": r["completed_class"],
            "income_limit": r["income_limit"],
            "categories": r["categories"],
            "gender": r["gender"],
            "benefit_amount": r["benefit_amount"],
            "benefit_amount_ta": r["benefit_amount_ta"],
            "deadline": r["deadline"],
            "official_url": r["official_url"],
            "source_authority": r["source_authority"],
            "last_verified": r["last_verified"],
            "status": r["status"]
        })
    return schemes

@app.patch("/api/admin/schemes/{scheme_id}")
def update_scheme_status(scheme_id: str, data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")

    status = data.get("status")
    income_limit = data.get("income_limit")
    deadline = data.get("deadline")

    updates = ["last_verified = ?"]
    params = [today]

    if status:
        updates.append("status = ?")
        params.append(status)
    if income_limit is not None:
        updates.append("income_limit = ?")
        params.append(int(income_limit))
    if deadline:
        updates.append("deadline = ?")
        params.append(deadline)

    params.append(scheme_id)

    query = f"UPDATE schemes SET {', '.join(updates)} WHERE scheme_id = ?"
    cursor.execute(query, tuple(params))
    conn.commit()
    conn.close()

    return {"status": "success", "scheme_id": scheme_id, "last_verified": today}

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse

# ----------------- LEARNING RESOURCES -----------------
@app.get("/api/learning")
def get_learning_resources():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM learning_resources")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Check if frontend/dist exists to serve the SPA
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    # Don't intercept API routes
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
    
    if FRONTEND_DIST.exists():
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)

    return HTMLResponse(
        """
        <!DOCTYPE html>
        <html>
        <head><title>SETU</title><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>
        <body style='font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:60px 20px;background:#F8FAFC;color:#0F172A;'>
            <div style='max-width:540px;margin:0 auto;background:#FFF;padding:40px;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);border:1px solid #E2E8F0;'>
                <h2 style='color:#1E3A8A;margin-bottom:12px;'>SETU Server is Running!</h2>
                <p style='color:#64748B;line-height:1.6;margin-bottom:24px;'>The frontend bundle was not found locally. Run <code>run_all.bat</code> or run <code>npm run build</code> in the frontend directory.</p>
                <a href='/docs' style='display:inline-block;background:#1E3A8A;color:#FFF;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;'>View Interactive API Docs &rarr;</a>
            </div>
        </body>
        </html>
        """
    )
