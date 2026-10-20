import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "IntakeAgent" in data["agents"]

def test_intake_api():
    response = client.post("/api/intake", json={
        "session_id": "api-test-1",
        "menu_choice": 3
    })
    assert response.status_code == 200
    data = response.json()
    assert data["profile"]["completed_class"] == 12

def test_eligibility_match_api():
    profile = {
        "completed_class": 12,
        "income": 150000,
        "category": "MBC",
        "gender": "female",
        "state": "Tamil Nadu"
    }
    response = client.post("/api/match", json=profile)
    assert response.status_code == 200
    data = response.json()
    assert data["eligible_count"] > 0
    # Should include Pudhumai Penn and Post-Matric BC/MBC
    eligible_ids = [s["scheme_id"] for s in data["schemes"] if s["eligible"]]
    assert "TN-PUDHUMAI-PENN" in eligible_ids
    assert "TN-POSTMATRIC-BC-MBC" in eligible_ids

def test_demo_skip_days():
    response = client.post("/api/demo/skip_days", json={"days": 5})
    assert response.status_code == 200
    data = response.json()
    assert data["days_skipped"] == 5
    assert "stuck_cases_count" in data
