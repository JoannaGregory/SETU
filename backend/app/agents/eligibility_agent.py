import json
import sqlite3
from typing import List, Dict, Any
from ..database import get_db
from ..models import SchemeMatchResult, SchemeCondition

def evaluate_eligibility(profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Deterministic rules engine. Compares student profile against ACTIVE schemes in SQLite.
    Returns matched schemes with verified reasons, sources, and requirements.
    """
    conn = get_db()
    cursor = conn.cursor()

    # Query only ACTIVE schemes (excluding STALE, EXPIRED, NEEDS_REVIEW)
    cursor.execute("""
        SELECT * FROM schemes WHERE status = 'ACTIVE'
    """)
    rows = cursor.fetchall()
    conn.close()

    results = []

    std_class = int(profile.get("completed_class", 10))
    std_income = int(profile.get("income", 200000))
    std_category = str(profile.get("category", "General")).strip()
    std_gender = str(profile.get("gender", "any")).strip().lower()
    std_state = str(profile.get("state", "Tamil Nadu")).strip()

    for r in rows:
        scheme_id = r["scheme_id"]
        name = r["name"]
        name_ta = r["name_ta"]
        sch_state = r["state"]
        sch_classes = [int(c.strip()) for c in r["completed_class"].split(",") if c.strip().isdigit()]
        sch_income_limit = int(r["income_limit"])
        sch_categories = [c.strip().upper() for c in r["categories"].split(",")]
        sch_gender = r["gender"].strip().lower()
        
        conditions = []

        # 1. State Domicile check
        state_met = (sch_state == "ALL" or sch_state.lower() == std_state.lower())
        conditions.append({
            "field": "state",
            "description": f"State domicile: {sch_state}",
            "met": state_met,
            "details": f"Student state: {std_state}"
        })

        # 2. Education Class check
        class_met = (std_class in sch_classes)
        conditions.append({
            "field": "completed_class",
            "description": f"Eligible for completed class: {', '.join(str(c) for c in sch_classes)}",
            "met": class_met,
            "details": f"Student completed: Class {std_class}"
        })

        # 3. Income Limit check
        income_met = (std_income <= sch_income_limit)
        conditions.append({
            "field": "income_limit",
            "description": f"Annual family income cap: ≤ ₹{sch_income_limit:,}",
            "met": income_met,
            "details": f"Student family income: ₹{std_income:,}"
        })

        # 4. Community / Category check
        if "ALL" in sch_categories or sch_categories == ["ALL"]:
            cat_met = True
            cat_desc = "Open to all social categories"
        else:
            cat_met = (std_category.upper() in sch_categories)
            cat_desc = f"Eligible categories: {', '.join(sch_categories)}"
        conditions.append({
            "field": "category",
            "description": cat_desc,
            "met": cat_met,
            "details": f"Student category: {std_category}"
        })

        # 5. Gender check
        if sch_gender == "any":
            gender_met = True
            gender_desc = "Open to all genders"
        else:
            gender_met = (std_gender == sch_gender)
            gender_desc = f"Designated for: {sch_gender.capitalize()} students"
        conditions.append({
            "field": "gender",
            "description": gender_desc,
            "met": gender_met,
            "details": f"Student gender: {std_gender.capitalize()}"
        })

        # All conditions must be met for eligibility
        is_eligible = all(c["met"] for c in conditions)

        results.append({
            "scheme_id": scheme_id,
            "name": name,
            "name_ta": name_ta,
            "state": sch_state,
            "eligible": is_eligible,
            "conditions": conditions,
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

    # Sort results: eligible first, then by benefit relevance
    results.sort(key=lambda s: (not s["eligible"], s["scheme_id"]))
    return results
