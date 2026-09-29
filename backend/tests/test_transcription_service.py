import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from services.transcription_service import TranscriptionService


def test_fallback_extraction_recovers_phone_age_and_location_from_transcript():
    service = TranscriptionService()

    transcript = (
        "Caller: This is Priya calling for my brother, John Doe. "
        "He is 52 years old and has chest pain and difficulty breathing. "
        "His phone number is 9876543210. We are at 45, Green Park, New Delhi. "
        "He is awake but sweating and nauseous. Please send an ambulance immediately. "
        "My number is 9811122233."
    )

    result = service._fallback_extract_patient_info(transcript)

    assert result["patient_name"] == "John Doe"
    assert result["patient_age"] == 52
    assert result["patient_phone"] == "9876543210"
    assert result["caller_phone"] == "9811122233"
    assert "Green Park" in result["location"]
    assert any("chest pain" in symptom.lower() for symptom in result["symptoms"])
    assert result["severity"] in {"critical", "high", "medium"}
