import re

from typing import Dict, Any, Tuple, List, Optional
from fastapi.concurrency import run_in_threadpool

# Active in-memory sessions: session_id -> { profile, history, step }
_SESSIONS: Dict[str, Dict[str, Any]] = {}

# Import Gemini extraction helper
from .gemini_intake import extract_profile

def get_or_create_session(session_id: str) -> Dict[str, Any]:
    if session_id not in _SESSIONS:
        _SESSIONS[session_id] = {
            "profile": {
                "name": "Student",
                "state": "Tamil Nadu",
                "completed_class": None,
                "income": None,
                "income_upper_bound": None,
                "income_lower_bound": None,
                "ambiguous_income": False,
                "category": None,
                "gender": None,
                "course_pursuing": None,
                "confirmed": False,
            },
            "step": "class",
        }
    return _SESSIONS[session_id]
    if session_id not in _SESSIONS:
        _SESSIONS[session_id] = {
            "profile": {
                "name": "Student",
                "state": "Tamil Nadu",
                "completed_class": None,
                "income": None,
                "category": None,
                "gender": None,
                "course_pursuing": None,
                "confirmed": False
            },
            "step": "class"
        }
    return _SESSIONS[session_id]

def parse_income(text: str) -> Optional[int]:
    """Parse income in various Indian formats in English & Tamil."""
    t = text.lower().replace(",", "").strip()
    
    # Tamil income phrases
    if "ஒரு லட்சத்தி" in t or "ஒரு லட்சம்" in t or "1 லட்சம்" in t:
        return 90000
    if "இரண்டு லட்சத்தி" in t or "இரண்டு லட்சம்" in t or "2 லட்சம்" in t:
        return 180000
    if "இரண்டரை லட்ச" in t or "2.5 லட்சம்" in t:
        return 220000
    if "மூன்று லட்ச" in t or "3 லட்சம்" in t:
        return 280000
    if "ஐந்து லட்ச" in t or "5 லட்சம்" in t:
        return 350000
    if "எண்பதாயிரம்" in t:
        return 80000
    if "ஐம்பதாயிரம்" in t:
        return 50000

    # English phrases
    if "below 1 lakh" in t or "below one lakh" in t or "under 1 lakh" in t or "under one lakh" in t:
        return 90000
    if "below 2 lakh" in t or "below two lakh" in t or "under 2 lakh" in t:
        return 180000
    if "below 2.5 lakh" in t or "below 2.5" in t:
        return 220000
    if "below 5 lakh" in t or "under 5 lakh" in t:
        return 350000

    # Numeric "lakh" or "lac"
    lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b', t)
    if lakh_match:
        val = float(lakh_match.group(1))
        return int(val * 100000)
    
    # Numeric "k" (e.g. 80k)
    k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', t)
    if k_match:
        val = float(k_match.group(1))
        return int(val * 1000)
    
    # Standalone numbers
    num_match = re.search(r'\b(\d{4,8})\b', t)
    if num_match:
        return int(num_match.group(1))
    
    return None

def parse_class(text: str) -> Optional[int]:
    """Parse class/education in English and Tamil."""
    t = text.lower()
    
    # Tamil matches
    if any(w in t for w in ["பத்தாம்", "பத்தாவது", "10-ம்", "10ம்", "10 வது", "பத்து"]):
        return 10
    if any(w in t for w in ["பதினொன்றாம்", "பதினொன்றாவது", "11-ம்", "11ம்", "11 வது", "பதினொன்று"]):
        return 11
    if any(w in t for w in ["பன்னிரண்டாம்", "பன்னிரண்டாவது", "12-ம்", "12ம்", "12 வது", "பன்னிரண்டு", "மேல்நிலை"]):
        return 12
    if any(w in t for w in ["கல்லூரி", "பட்டப்படிப்பு", "டிப்ளமோ"]):
        return 12

    # English matches
    if "12" in t or "twelfth" in t or "+2" in t or "hsc" in t:
        return 12
    if "11" in t or "eleventh" in t or "+1" in t:
        return 11
    if "10" in t or "tenth" in t or "sslc" in t:
        return 10
    if "college" in t or "degree" in t or "diploma" in t:
        return 12

    return None

def parse_category(text: str) -> Optional[str]:
    """Parse community/category in English and Tamil."""
    t_upper = text.upper()
    for cat in ["MBC", "DNC", "SC", "ST", "BC", "OC", "GENERAL"]:
        if re.search(r'\b' + cat + r'\b', t_upper):
            return "General" if cat in ["OC", "GENERAL"] else cat
            
    t = text.lower()
    if "மிகவும் பிற்படுத்தப்பட்டோர்" in t or "சீர்மரபினர்" in t or "mbc" in t or "dnc" in t:
        return "MBC"
    if "பிற்படுத்தப்பட்டோர்" in t or "bc" in t or "backward" in t:
        return "BC"
    if "ஆதிதிராவிடர்" in t or "பட்டியலின" in t or "sc" in t or "scheduled caste" in t or "dalit" in t:
        return "SC"
    if "பழங்குடியினர்" in t or "st" in t or "scheduled tribe" in t or "tribal" in t:
        return "ST"
    if "பொதுப்பிரிவு" in t or "oc" in t or "general" in t:
        return "General"

    return None

def parse_gender(text: str) -> Optional[str]:
    """Parse gender in English and Tamil."""
    t = text.lower()
    # Tamil female words: மகள் (daughter), பெண் (female), மாணவி (female student)
    if any(w in t for w in ["மகள்", "பெண்", "மாணவி", "சிறுமி", "girl", "female", "woman", "daughter", "she"]):
        return "female"
    # Tamil male words: மகன் (son), ஆண் (male), மாணவன் / மாணவர் (male student), பையன் (boy)
    if any(w in t for w in ["மகன்", "ஆண்", "மாணவன்", "மாணவர்", "பையன்", "boy", "male", "man", "son", "he"]):
        return "male"
    return None

def is_affirmative(text: str) -> bool:
    """Check if text is an affirmative confirmation in English or Tamil."""
    t = text.lower().strip()
    return any(w in t for w in [
        "ஆம்", "சரி", "உறுதி", "சரியானது", "சரியாக", "1", "yes", "correct", "confirm", "right", "true", "ok", "okay"
    ])

def process_intake_message(session_id: str, message: Optional[str] = None, menu_choice: Optional[int] = None, field_updates: Optional[Dict[str, Any]] = None, language: str = "en") -> Dict[str, Any]:
    session = get_or_create_session(session_id)
    profile = session["profile"]

    # Manual field updates if sent by UI
    if field_updates:
        for k, v in field_updates.items():
            if v is not None:
                profile[k] = v

    text = (message or "").strip()

    # Process menu choices according to current step
    step = session["step"]
    if menu_choice is not None:
        if step == "class":
            mapping = {1: 10, 2: 11, 3: 12, 4: 12}
            profile["completed_class"] = mapping.get(menu_choice, 10)
        elif step == "gender":
            profile["gender"] = "female" if menu_choice == 1 else "male"
        elif step == "income":
            mapping = {1: 90000, 2: 180000, 3: 240000, 4: 400000, 5: 750000}
            profile["income"] = mapping.get(menu_choice, 150000)
        elif step == "category":
            mapping = {1: "BC", 2: "MBC", 3: "SC", 4: "ST", 5: "General"}
            profile["category"] = mapping.get(menu_choice, "BC")
        elif step == "confirm":
            if menu_choice == 1:
                profile["confirmed"] = True

    # Natural language parsing on message
    if text:
        # Check if user says reset
        if any(w in text.lower() for w in ["reset", "restart", "start over", "மீண்டும்"]):
            session["profile"] = {
                "name": "Student",
                "state": "Tamil Nadu",
                "completed_class": None,
                "income": None,
                "category": None,
                "gender": None,
                "course_pursuing": None,
                "confirmed": False
            }
            session["step"] = "class"
            profile = session["profile"]

        # If we are in confirmation step, check if user confirms via text
        if step == "confirm":
            if is_affirmative(text):
                profile["confirmed"] = True

        # Use Gemini to extract fields from free‑text input
        try:
            parsed = extract_profile(text)
            # Map Gemini fields to our session profile
            if parsed.student_class is not None:
                profile["completed_class"] = parsed.student_class
            if parsed.gender is not None:
                profile["gender"] = parsed.gender
            if parsed.annual_income_rupees is not None:
                profile["income"] = parsed.annual_income_rupees
            if parsed.income_upper_bound is not None:
                profile["income_upper_bound"] = parsed.income_upper_bound
            if parsed.income_lower_bound is not None:
                profile["income_lower_bound"] = parsed.income_lower_bound
            if parsed.ambiguous_income:
                profile["ambiguous_income"] = True
            if parsed.category is not None:
                profile["category"] = parsed.category
            if parsed.state is not None:
                profile["state"] = parsed.state
        except Exception as e:
            print(f"Gemini extraction failed: {e}")
        # Preserve original Tamil Nadu detection for fallback
        if any(w in text.lower() for w in ["tamil nadu", "tamilnadu", "tn", "தமிழ்நாடு", "தமிழ் நாடு"]):
            profile["state"] = "Tamil Nadu"
        # Old heuristic parsing (commented out)
        # c = parse_class(text)
        # if c: profile["completed_class"] = c
        # g = parse_gender(text)
        # if g: profile["gender"] = g
        # inc = parse_income(text)
        # if inc: profile["income"] = inc
        # cat = parse_category(text)
        # if cat: profile["category"] = cat
        c = parse_class(text)
        if c: profile["completed_class"] = c
        
        g = parse_gender(text)
        if g: profile["gender"] = g
        
        inc = parse_income(text)
        if inc: profile["income"] = inc
        
        cat = parse_category(text)
        if cat: profile["category"] = cat

        if any(w in text.lower() for w in ["tamil nadu", "tamilnadu", "tn", "தமிழ்நாடு", "தமிழ் நாடு"]):
            profile["state"] = "Tamil Nadu"

    # Identify missing fields in priority order
    missing = []
    if profile.get("completed_class") is None: missing.append("completed_class")
    if profile.get("gender") is None: missing.append("gender")
    if profile.get("income") is None: missing.append("income")
    if profile.get("category") is None: missing.append("category")

    # If all fields are present and user confirmed, finish intake
    if len(missing) == 0 and profile.get("confirmed", False):
        session["step"] = "complete"
        return {
            "session_id": session_id,
            "reply": "Profile confirmed successfully! Matching eligible scholarships now...",
            "reply_ta": "விவரங்கள் வெற்றிகரமாக உறுதிப்படுத்தப்பட்டது! உங்களுக்கான உதவித்தொகை திட்டங்கள் கணக்கிடப்படுகின்றன...",
            "profile": profile,
            "missing_fields": [],
            "next_question": None,
            "next_question_ta": None,
            "menu_options": [],
            "is_complete": True,
            "ready_for_confirmation": False,
            "confirmed": True
        }

    # Generate reply and options based on next missing field
    if "completed_class" in missing:
        session["step"] = "class"
        reply = "Vanakkam! Welcome to SETU. What is the student's highest completed education level?"
        reply_ta = "வணக்கம்! சேது (SETU) தளத்திற்கு வரவேற்கிறோம். மாணவர் முடித்த கல்வி தகுதி என்ன?"
        options = [
            {"id": 1, "label": "Completed 10th (SSLC)", "label_ta": "10-ம் வகுப்பு முடித்தவர்"},
            {"id": 2, "label": "Completed 11th (+1)", "label_ta": "11-ம் வகுப்பு முடித்தவர்"},
            {"id": 3, "label": "Completed 12th (HSC / +2)", "label_ta": "12-ம் வகுப்பு முடித்தவர்"},
            {"id": 4, "label": "Entering College / Diploma", "label_ta": "கல்லூரி / டிப்ளமோ சேருபவர்"}
        ]
        next_q = "Please select completed standard (1-4) or speak/type."
        next_q_ta = "முடித்த வகுப்பைத் தேர்ந்தெடுக்கவும் (1-4) அல்லது கூறவும்."

    elif "gender" in missing:
        session["step"] = "gender"
        reply = "Got it! Is the applicant female or male? (Several special welfare schemes like Pudhumai Penn & Pragati are dedicated to girl students)."
        reply_ta = "சரி! விண்ணப்பதாரர் மாணவியா அல்லது மாணவரா? (புதுமைப் பெண், பிரகதி போன்ற சிறப்பு திட்டங்கள் மாணவிகளுக்கானவை)."
        options = [
            {"id": 1, "label": "Female / Girl Student", "label_ta": "மாணவி (பெண்)"},
            {"id": 2, "label": "Male / Boy Student", "label_ta": "மாணவர் (ஆண்)"}
        ]
        next_q = "Select gender to unlock targeted grants."
        next_q_ta = "பாலினத்தைத் தேர்ந்தெடுக்கவும்."

    elif "income" in missing:
        session["step"] = "income"
        reply = "What is your approximate annual family income? (Most government scholarships require annual income under ₹2.5 Lakhs)."
        reply_ta = "உங்கள் குடும்பத்தின் தோராயமான ஆண்டு வருமானம் என்ன? (பெரும்பாலான கல்வி உதவித்தொகைகளுக்கு ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள் இருக்க வேண்டும்)."
        options = [
            {"id": 1, "label": "Below ₹1,00,000 / year", "label_ta": "₹1,00,000-க்கு கீழ்"},
            {"id": 2, "label": "₹1,00,000 - ₹2,00,000", "label_ta": "₹1,00,000 முதல் ₹2,00,000"},
            {"id": 3, "label": "₹2,00,000 - ₹2,50,000", "label_ta": "₹2,00,000 முதல் ₹2,50,000"},
            {"id": 4, "label": "₹2,50,000 - ₹5,00,000", "label_ta": "₹2,50,000 முதல் ₹5,00,000"},
            {"id": 5, "label": "Above ₹5,00,000", "label_ta": "₹5,00,000-க்கு மேல்"}
        ]
        next_q = "Select annual income band or type exact amount."
        next_q_ta = "வருமான வரம்பைத் தேர்ந்தெடுக்கவும்."

    elif "category" in missing:
        session["step"] = "category"
        reply = "What is your community / social category? (Tamil Nadu welfare departments provide fee waivers based on community reservation)."
        reply_ta = "உங்கள் சமூகப் பிரிவு (Community Category) என்ன? (தமிழ்நாடு அரசு சமூகப் பிரிவு அடிப்படையில் கட்டண விலக்கு அளிக்கிறது)."
        options = [
            {"id": 1, "label": "BC (Backward Class)", "label_ta": "BC (பிற்படுத்தப்பட்டோர்)"},
            {"id": 2, "label": "MBC / DNC", "label_ta": "MBC / DNC (மிகவும் பிற்படுத்தப்பட்டோர்)"},
            {"id": 3, "label": "SC (Scheduled Caste)", "label_ta": "SC (ஆதிதிராவிடர்)"},
            {"id": 4, "label": "ST (Scheduled Tribe)", "label_ta": "ST (பழங்குடியினர்)"},
            {"id": 5, "label": "General / OC", "label_ta": "General / OC (பொதுப்பிரிவு)"}
        ]
        next_q = "Select community category."
        next_q_ta = "சமூகப் பிரிவைத் தேர்ந்தெடுக்கவும்."

    else:
        # All required fields are present but not yet confirmed
        session["step"] = "confirm"
        inc_formatted = f"₹ {profile['income']:,}" if profile.get('income') else "Not specified"
        gender_display = profile.get('gender', '').capitalize()
        gender_display_ta = "ஆண் (Male)" if profile.get('gender') == 'male' else "பெண் (Female)"
        
        reply = f"Great! Profile summary:\n• Education: Class {profile['completed_class']}\n• State: {profile['state']}\n• Gender: {gender_display}\n• Family Income: {inc_formatted}\n• Community: {profile['category']}\n\nIs this accurate?"
        reply_ta = f"அருமை! விவரச் சுருக்கம்:\n• கல்வி: வகுப்பு {profile['completed_class']}\n• மாநிலம்: {profile['state']}\n• பாலினம்: {gender_display_ta}\n• ஆண்டு வருமானம்: {inc_formatted}\n• சமூகப்பிரிவு: {profile['category']}\n\nஇந்தத் தகவல்கள் சரியானவையா?"
        options = [
            {"id": 1, "label": "1) Yes, Confirm & Find Eligible Schemes", "label_ta": "1) ஆம், சரிபார்க்கப்பட்டு திட்டங்களை காண்க"},
            {"id": 2, "label": "2) No, Change Details", "label_ta": "2) இல்லை, திருத்தம் செய்"}
        ]
        next_q = "Confirm to execute deterministic eligibility rules."
        next_q_ta = "உதவித்தொகை தகுதியை சரிபார்க்க உறுதிப்படுத்தவும்."

    return {
        "session_id": session_id,
        "reply": reply,
        "reply_ta": reply_ta,
        "profile": profile,
        "missing_fields": missing,
        "next_question": next_q,
        "next_question_ta": next_q_ta,
        "menu_options": options,
        "is_complete": len(missing) == 0,
        "ready_for_confirmation": len(missing) == 0 and not profile.get("confirmed", False)
    }
