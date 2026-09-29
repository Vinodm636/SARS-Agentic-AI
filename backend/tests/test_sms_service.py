import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from services.sms_service import WhatsAppService


def test_assignment_notification_falls_back_to_mock_delivery_when_twilio_is_unconfigured():
    service = WhatsAppService.__new__(WhatsAppService)
    service.is_configured = False

    response = service.send_hospital_assignment(
        driver_phone="+919876543210",
        ambulance_id="AMB-101",
        hospital_name="City General Hospital",
        hospital_address="12 Main Street",
        patient_info="Patient with chest pain",
        eta="8 minutes",
    )

    assert response["mock"] is True
    assert response["success"] is True
    assert response["type"] == "whatsapp"
    assert response["channels"]["whatsapp"] is True
    assert response["channels"]["sms"] is True
