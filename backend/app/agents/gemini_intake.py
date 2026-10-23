import os
import json
from typing import Literal, List, Optional

from google import genai
from pydantic import BaseModel, Field


class ExtractedProfile(BaseModel):
    """Structured profile extracted from free‑text user input using Gemini.

    The fields correspond to the ones used in ``StudentProfile`` but are all
    optional because the user may provide only a subset.
    """
    student_class: Optional[Literal[10, 11, 12]] = None
    gender: Optional[Literal["female", "male"]] = None
    category: Optional[Literal["BC", "MBC", "DNC", "SC", "ST", "General"]] = None
    # Exact annual family income (if explicitly stated)
    annual_income_rupees: Optional[int] = Field(
        None, ge=0, description="Exact annual family income in INR"
    )
    # Upper / lower bounds when only a range is given
    income_upper_bound_rupees: Optional[int] = Field(
        None, ge=0, description="Upper bound of income range"
    )
    income_lower_bound_rupees: Optional[int] = Field(
        None, ge=0, description="Lower bound of income range"
    )
    # Flag indicating that the income could not be resolved to an exact number or range
    ambiguous_income: bool = Field(False, description="True if income parsing was ambiguous")
    state: Optional[str] = None
    # Any fields we could not map are returned here for diagnostics
    ambiguous_fields: List[str] = Field(default_factory=list)

# Initialise Gemini client – the API key must be present in the environment.
# Initialise Gemini client – the API key must be present in the environment.
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not configured")
# Configure the new SDK

import os
from google import genai

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)

MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")


def _build_prompt(text: str) -> str:
    """Create a Gemini prompt that asks for a JSON representation of ``ExtractedProfile``.

    The prompt explicitly requests *only* the fields defined in ``ExtractedProfile``
    and asks Gemini to output **pure JSON** (no extra prose). This makes parsing
    deterministic.
    """
    return (
        "You are an assistant that extracts a student's education and eligibility "
        "information from a free‑text message. Return a JSON object that conforms to "
        "the following Pydantic model (no surrounding text, no markdown):\n\n"
        f"{ExtractedProfile.schema_json(indent=2)}\n\n"
        "Only fill fields that are explicitly mentioned in the message. If a field is "
        "not present, leave it as null (or empty list for ambiguous_fields). If the "
        "income is expressed as a range (e.g., 'between 1 lakh and 2 lakh'), fill the "
        "upper/lower bounds and set ambiguous_income to true. If the income is a "
        "single exact amount, fill annual_income_rupees. If nothing about income is "
        "stated, leave all income‑related fields null.\n\n"
        f"User message: ""{text}"""
    )


def extract_profile(text: str) -> ExtractedProfile:
    """Call Gemini and parse the JSON response into :class:`ExtractedProfile`."""
    if not text:
        raise ValueError("Empty text cannot be processed")

    prompt = _build_prompt(text)
    # Use the new SDK: create a GenerativeModel and request JSON output
    model = genai.GenerativeModel(MODEL)
    response = client.models.generate_content(
    model=MODEL,
    contents=prompt,
    config={
        "response_mime_type": "application/json",
        "response_schema": ExtractedProfile,
        "temperature": 0,
    },
)
    # Gemini may return the JSON as raw text or inside a part object.
    raw = response.text
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Gemini returned non‑JSON output: {raw!r}") from exc
    return ExtractedProfile(**data)
