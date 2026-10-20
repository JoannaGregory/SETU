import json
from typing import Dict, Any, Optional
from ..database import get_db

def get_application_guidance(scheme_id: str, student_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE scheme_id = ?", (scheme_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {"error": "Scheme not found"}

    docs = json.loads(row["documents"])
    steps = json.loads(row["apply_steps"])

    # Detailed document checklist with guidance
    doc_details = []
    for doc in docs:
        hint = "Available via nearest e-Sevai centre or online portal"
        if "Aadhaar" in doc or "Bank" in doc:
            hint = "Must be active & mapped with NPCI for Direct Benefit Transfer"
        elif "Income" in doc:
            hint = "Must be valid for financial year 2026-2027 (issued by Tahsildar)"
        elif "Community" in doc:
            hint = "Permanent community card with digital barcode"
        elif "Marksheet" in doc:
            hint = "Original or DigiLocker verified digital copy"
        
        doc_details.append({
            "name": doc,
            "required": True,
            "issuing_authority_hint": hint,
            "uploaded": False
        })

    return {
        "scheme_id": row["scheme_id"],
        "scheme_name": row["name"],
        "scheme_name_ta": row["name_ta"],
        "official_url": row["official_url"],
        "source_authority": row["source_authority"],
        "deadline": row["deadline"],
        "benefit_amount": row["benefit_amount"],
        "benefit_amount_ta": row["benefit_amount_ta"],
        "last_verified": row["last_verified"],
        "checklist": doc_details,
        "steps": steps,
        "support_helpline": "1800-425-1333 (Tamil Nadu e-Governance Helpline)",
        "tip": "Never pay any agent or middleman. Government scholarship applications are 100% free of charge."
    }
