from app.agents.intake_agent import process_intake_message

session_id = "test-tamil-convo"

# 1. User says: என் மகன் பத்தாம் வகுப்பு படிக்கிறான்
r1 = process_intake_message(session_id=session_id, message="என் மகன் பத்தாம் வகுப்பு படிக்கிறான்")
print("R1 missing:", r1["missing_fields"]) # should only need income & category now!

# 2. User says: ஒரு லட்சத்திற்கும் கீழ்
r2 = process_intake_message(session_id=session_id, message="ஒரு லட்சத்திற்கும் கீழ்")
print("R2 missing:", r2["missing_fields"]) # should only need category!

# 3. User says: பிற்படுத்தப்பட்டோர்
r3 = process_intake_message(session_id=session_id, message="பிற்படுத்தப்பட்டோர்")
print("R3 is_complete:", r3["is_complete"], "ready_for_confirm:", r3["ready_for_confirmation"])

# 4. User says: 1) ஆம், சரிபார்க்கப்பட்டு திட்டங்களை காண்க
r4 = process_intake_message(session_id=session_id, message="1) ஆம், சரிபார்க்கப்பட்டு திட்டங்களை காண்க")
print("R4 confirmed:", r4.get("confirmed"), "step complete:", r4.get("is_complete"))
