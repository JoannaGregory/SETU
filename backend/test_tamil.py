import sys
from app.agents.intake_agent import parse_class, parse_gender, parse_income, parse_category

test_inputs = [
    'என் மகன் பத்தாம் வகுப்பு படிக்கிறான்',
    'வணக்கம் வணக்கம் எனது மகன்',
    'எனது மகன் பத்தாம் வகுப்பு',
    'பத்தாம் வகுப்பு',
    'மாணவர் ஆண்',
    'ஒரு லட்சத்திற்கும் கீழ்',
    'BC (பிற்படுத்தப்பட்டோர்)'
]

with open("test_tamil_results.txt", "w", encoding="utf-8") as f:
    for t in test_inputs:
        f.write(f"Input: {t}\n")
        f.write(f"  Class: {parse_class(t)}\n")
        f.write(f"  Gender: {parse_gender(t)}\n")
        f.write(f"  Income: {parse_income(t)}\n")
        f.write(f"  Category: {parse_category(t)}\n")
