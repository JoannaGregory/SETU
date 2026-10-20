import sqlite3
from datetime import datetime
from typing import List, Dict, Any
from ..database import get_db

def evaluate_followups() -> Dict[str, Any]:
    """
    Checks all open cases. Identifies cases inactive >= 5 days and triggers
    automatic reminders and teacher dashboard alerts.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM cases WHERE status NOT IN ('APPLIED', 'COMPLETED')
    """)
    cases = cursor.fetchall()

    stuck_count = 0
    alerts_created = 0
    reminders_sent = 0
    updated_cases = []

    for c in cases:
        case_id = c["case_id"]
        days = c["days_inactive"]
        status = c["status"]
        teacher_alert = c["teacher_alert"]

        if days >= 5:
            stuck_count += 1
            new_status = "STUCK" if status in ["DOCUMENTS_PENDING", "MATCHED"] else status
            new_alert = 1
            new_reminder = 1

            cursor.execute("""
                UPDATE cases
                SET status = ?, teacher_alert = ?, reminder_sent = ?, updated_at = ?
                WHERE case_id = ?
            """, (new_status, new_alert, new_reminder, datetime.now().strftime("%Y-%m-%d"), case_id))

            if not teacher_alert:
                alerts_created += 1
            reminders_sent += 1

            updated_cases.append({
                "case_id": case_id,
                "student_name": c["student_name"],
                "scheme_name": c["scheme_name"],
                "days_inactive": days,
                "new_status": new_status,
                "action": "Flagged to teacher & SMS/WhatsApp reminder queued"
            })

    conn.commit()
    conn.close()

    return {
        "status": "evaluated",
        "stuck_cases_count": stuck_count,
        "new_teacher_alerts": alerts_created,
        "reminders_dispatched": reminders_sent,
        "affected_cases": updated_cases
    }

def fast_forward_days(days: int = 5) -> Dict[str, Any]:
    """
    Demo trigger for hackathon judges: fast-forwards time by N days on active cases,
    instantly demonstrating the Follow-up Agent in action.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Increment days_inactive on pending cases
    cursor.execute("""
        UPDATE cases
        SET days_inactive = days_inactive + ?
        WHERE status NOT IN ('COMPLETED')
    """, (days,))
    conn.commit()
    conn.close()

    # Run followup evaluation immediately
    eval_result = evaluate_followups()
    eval_result["days_skipped"] = days
    eval_result["message"] = f"Simulated {days} days elapsed. Follow-up Agent ran automatic escalation."
    return eval_result
