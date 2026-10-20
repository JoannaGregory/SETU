import pytest
from app.agents.eligibility_agent import evaluate_eligibility
from app.database import init_db

@pytest.fixture(autouse=True)
def setup_database():
    init_db()

def test_pudhumai_penn_girl_student():
    # Girl student, 12th passed, Tamil Nadu -> Must match Pudhumai Penn
    profile = {
        "completed_class": 12,
        "income": 120000,
        "category": "BC",
        "gender": "female",
        "state": "Tamil Nadu"
    }
    results = evaluate_eligibility(profile)
    pudhumai = next((s for s in results if s["scheme_id"] == "TN-PUDHUMAI-PENN"), None)
    assert pudhumai is not None
    assert pudhumai["eligible"] is True

def test_pudhumai_penn_boy_ineligible():
    # Boy student -> Must NOT match Pudhumai Penn
    profile = {
        "completed_class": 12,
        "income": 120000,
        "category": "BC",
        "gender": "male",
        "state": "Tamil Nadu"
    }
    results = evaluate_eligibility(profile)
    pudhumai = next((s for s in results if s["scheme_id"] == "TN-PUDHUMAI-PENN"), None)
    assert pudhumai is not None
    assert pudhumai["eligible"] is False

def test_post_matric_bc_income_cutoff():
    # Income 2,00,000 <= 2,50,000 -> Eligible
    profile_ok = {
        "completed_class": 10,
        "income": 200000,
        "category": "BC",
        "gender": "male",
        "state": "Tamil Nadu"
    }
    results_ok = evaluate_eligibility(profile_ok)
    bc_scheme = next((s for s in results_ok if s["scheme_id"] == "TN-POSTMATRIC-BC-MBC"), None)
    assert bc_scheme is not None
    assert bc_scheme["eligible"] is True

    # Income 3,00,000 > 2,50,000 -> Ineligible
    profile_high_income = {
        "completed_class": 10,
        "income": 300000,
        "category": "BC",
        "gender": "male",
        "state": "Tamil Nadu"
    }
    results_high = evaluate_eligibility(profile_high_income)
    bc_scheme_high = next((s for s in results_high if s["scheme_id"] == "TN-POSTMATRIC-BC-MBC"), None)
    assert bc_scheme_high is not None
    assert bc_scheme_high["eligible"] is False
