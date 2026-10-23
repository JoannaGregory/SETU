import sqlite3
from datetime import datetime
from typing import List, Dict, Any

from ..database import get_db


def get_my_applications(student_name: str) -> List[Dict[str, Any]]:
    """Return a list of the student's applications with deadline countdown.

    For each case we fetch the related scheme to read its deadline, then compute
    how many days are left from *today*.

    The result includes a human‑readable message such as "3 days remaining"
    and the raw ``deadline`` string for UI rendering.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Retrieve cases for the given student name
    cursor.execute(
        """
        SELECT c.case_id, c.scheme_id, c.scheme_name, s.deadline
        FROM cases c
        JOIN schemes s ON c.scheme_id = s.scheme_id
        WHERE c.student_name = ?
        """,
        (student_name,)
    )
    rows = cursor.fetchall()
    conn.close()

    today = datetime.now().date()
    applications: List[Dict[str, Any]] = []
    for r in rows:
        deadline_str: str = r["deadline"]  # format YYYY-MM-DD
        try:
            deadline_date = datetime.strptime(deadline_str, "%Y-%m-%d").date()
            delta = (deadline_date - today).days
        except Exception:
            # If parsing fails, fall back to unknown
            delta = None

        if delta is None:
            remaining_msg = "deadline unknown"
        elif delta > 0:
            remaining_msg = f"{delta} day{'s' if delta != 1 else ''} remaining"
        elif delta == 0:
            remaining_msg = "deadline today"
        else:
            remaining_msg = f"deadline passed {abs(delta)} day{'s' if abs(delta) != 1 else ''} ago"

        applications.append(
            {
                "case_id": r["case_id"],
                "scheme_id": r["scheme_id"],
                "scheme_name": r["scheme_name"],
                "deadline": deadline_str,
                "days_remaining": delta,
                "status_message": remaining_msg,
            }
        )
    return applications
