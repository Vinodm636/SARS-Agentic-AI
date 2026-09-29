"""
Tests for SMSNotificationService — free-provider edition
=========================================================
Covers every requirement from the spec:

  ✓ Unit test for SMS service
  ✓ Valid driver phone number
  ✓ Missing phone number
  ✓ Invalid phone number
  ✓ Failed SMS API (network / HTTP error)
  ✓ Ambulance dispatch still succeeds when SMS fails
  ✓ Mock provider (SMS_PROVIDER=mock) logs only, no network
  ✓ Textbelt provider — success, quota-exceeded, test-key, timeout
  ✓ textbee provider — success, no device, HTTP error, timeout
  ✓ Provider switching via SMS_PROVIDER env var
  ✓ Credentials never logged
  ✓ dispatch router — sms_status in response and in-memory record
  ✓ SMS status endpoint returns masked phone

Run:
    cd backend
    pytest tests/test_sms_notification_service.py -v
"""

from __future__ import annotations

import asyncio
import importlib.util as _ilu
import pathlib as _pl
import sys
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Load the module directly — avoids triggering services/__init__.py which
# would pull in groq/twilio at collection time.
# ---------------------------------------------------------------------------
_root = _pl.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_root))


def _load_sms_module():
    path = _root / "services" / "sms_notification_service.py"
    spec = _ilu.spec_from_file_location("services.sms_notification_service", path)
    mod = _ilu.module_from_spec(spec)
    sys.modules["services.sms_notification_service"] = mod
    spec.loader.exec_module(mod)
    return mod


_sms = _load_sms_module()

SMSNotificationService = _sms.SMSNotificationService
MockProvider = _sms.MockProvider
TextbeltProvider = _sms.TextbeltProvider
TextbeeProvider = _sms.TextbeeProvider
_is_valid_e164 = _sms._is_valid_e164
_normalise_phone = _sms._normalise_phone
_result = _sms._result


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_service(provider_name: str = "mock", **env_overrides) -> SMSNotificationService:
    """Instantiate the service with a controlled environment."""
    defaults = {
        "SMS_PROVIDER": provider_name,
        "TEXTBELT_API_KEY": "testbelt_test",
        "TEXTBEE_API_KEY": "tbkey123",
        "TEXTBEE_DEVICE_ID": "dev001",
        "TRACKING_BASE_URL": "http://localhost:3000",
    }
    defaults.update(env_overrides)
    with patch.dict("os.environ", defaults, clear=False):
        return SMSNotificationService()


def _mock_httpx_post(json_body: dict, status_code: int = 200):
    """Return a mock httpx response for use with patch."""
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_body
    resp.raise_for_status = MagicMock()
    if status_code >= 400:
        import httpx
        resp.raise_for_status.side_effect = httpx.HTTPStatusError(
            "HTTP error", request=MagicMock(), response=resp
        )
    return resp


# ===========================================================================
# 1. Phone helpers
# ===========================================================================

class TestPhoneHelpers:

    @pytest.mark.parametrize("phone", [
        "+917483588380", "+14155550000", "+447911123456", "+12025551234",
    ])
    def test_valid_e164_accepted(self, phone):
        assert _is_valid_e164(phone) is True

    @pytest.mark.parametrize("phone", [
        "9876543210", "not-a-number", "", "+1", "07700900123", "  ",
    ])
    def test_invalid_e164_rejected(self, phone):
        assert _is_valid_e164(phone) is False

    def test_normalise_already_valid(self):
        assert _normalise_phone("+917483588380") == "+917483588380"

    def test_normalise_missing_plus(self):
        assert _normalise_phone("917483588380") == "+917483588380"

    def test_normalise_00_prefix(self):
        assert _normalise_phone("00917483588380") == "+917483588380"

    def test_normalise_10_digit_india(self):
        assert _normalise_phone("9876543210") == "+919876543210"

    def test_normalise_strips_spaces_dashes(self):
        assert _normalise_phone("+91 748-358 8380") == "+917483588380"

    def test_normalise_empty(self):
        assert _normalise_phone("") == ""


# ===========================================================================
# 2. Message formatting
# ===========================================================================

class TestFormatEmergencySms:

    def setup_method(self):
        self.svc = _make_service("mock")

    def test_all_required_fields_present(self):
        msg = self.svc.format_emergency_sms(
            ambulance_id="AMB-105",
            emergency_details="Chest pain, male 55",
            pickup_location="Connaught Place",
            priority="high",
            driver_name="Amit Sharma",
        )
        assert "AMB-105" in msg
        assert "Chest pain" in msg
        assert "Connaught Place" in msg
        assert "HIGH" in msg
        assert "Amit Sharma" in msg
        assert "localhost:3000" in msg
        assert "immediately" in msg.lower()

    def test_custom_tracking_link(self):
        msg = self.svc.format_emergency_sms(
            ambulance_id="AMB-208",
            emergency_details="Accident",
            pickup_location="India Gate",
            priority="critical",
            tracking_link="https://sars.example.com/track/AMB-208",
        )
        assert "https://sars.example.com/track/AMB-208" in msg

    def test_no_driver_name_no_artefact(self):
        msg = self.svc.format_emergency_sms(
            ambulance_id="AMB-312",
            emergency_details="Stroke",
            pickup_location="Karol Bagh",
            priority="medium",
        )
        assert "Driver None" not in msg
        assert "Driver ," not in msg
        assert "AMB-312" in msg

    def test_priority_uppercased(self):
        for raw, expected in [("low", "LOW"), ("HIGH", "HIGH"), ("critical", "CRITICAL")]:
            msg = self.svc.format_emergency_sms(
                ambulance_id="X", emergency_details="T",
                pickup_location="L", priority=raw,
            )
            assert expected in msg


# ===========================================================================
# 3. MockProvider
# ===========================================================================

class TestMockProvider:

    def setup_method(self):
        self.svc = _make_service("mock")

    def test_mock_returns_success(self):
        result = self.svc.send_sms("+917483588380", "Test")
        assert result["success"] is True
        assert result["mock"] is True
        assert result["provider"] == "mock"

    def test_mock_makes_no_http_call(self):
        import httpx
        with patch.object(httpx, "post", side_effect=Exception("should not call")) as m:
            result = self.svc.send_sms("+917483588380", "Test")
        assert result["success"] is True
        m.assert_not_called()

    def test_service_is_mock_property(self):
        assert self.svc.is_mock is True


# ===========================================================================
# 4. Input validation (provider-agnostic)
# ===========================================================================

class TestInputValidation:

    def setup_method(self):
        self.svc = _make_service("mock")

    def test_missing_phone_fails(self):
        r = self.svc.send_sms("", "Message")
        assert r["success"] is False
        assert "missing" in r["error"].lower()

    def test_whitespace_phone_fails(self):
        r = self.svc.send_sms("   ", "Message")
        assert r["success"] is False

    def test_none_phone_handled(self):
        r = self.svc.send_sms(None, "Message")  # type: ignore[arg-type]
        assert r["success"] is False

    def test_invalid_phone_format_fails(self):
        r = self.svc.send_sms("not-a-phone", "Message")
        assert r["success"] is False
        assert "invalid" in r["error"].lower()

    def test_empty_message_fails(self):
        r = self.svc.send_sms("+917483588380", "")
        assert r["success"] is False
        assert "empty" in r["error"].lower()

    def test_result_always_has_required_keys(self):
        for phone, msg in [("", "hi"), ("+917483588380", ""), ("bad", "hi")]:
            r = self.svc.send_sms(phone, msg)
            for key in ("success", "error", "to", "mock", "sent_at",
                        "message_id", "message_sid", "provider"):
                assert key in r, f"Key '{key}' missing for ({phone!r}, {msg!r})"


# ===========================================================================
# 5. TextbeltProvider — unit tests
# ===========================================================================

class TestTextbeltProvider:

    def _provider(self, key: str = "testbelt_test") -> TextbeltProvider:
        return TextbeltProvider(key)

    def test_successful_send(self):
        provider = self._provider()
        mock_resp = _mock_httpx_post({"success": True, "textId": 12345, "quotaRemaining": 0})
        with patch("httpx.post", return_value=mock_resp):
            r = provider.send("+917483588380", "Alert")
        assert r["success"] is True
        assert r["message_id"] == "12345"
        assert r["provider"] == "textbelt"

    def test_quota_exceeded(self):
        provider = self._provider()
        mock_resp = _mock_httpx_post({"success": False, "error": "Out of quota"})
        with patch("httpx.post", return_value=mock_resp):
            r = provider.send("+917483588380", "Alert")
        assert r["success"] is False
        assert "quota" in r["error"].lower()

    def test_test_key_returns_mock_true(self):
        provider = self._provider("textbelt_test")
        assert provider.is_test_key is True
        mock_resp = _mock_httpx_post({"success": True, "textId": 0, "quotaRemaining": 0})
        with patch("httpx.post", return_value=mock_resp):
            r = provider.send("+917483588380", "Test")
        assert r["mock"] is True

    def test_real_key_returns_mock_false(self):
        provider = self._provider("textbelt")
        mock_resp = _mock_httpx_post({"success": True, "textId": 1, "quotaRemaining": 0})
        with patch("httpx.post", return_value=mock_resp):
            r = provider.send("+917483588380", "Test")
        assert r["mock"] is False

    def test_timeout_returns_failure(self):
        import httpx
        provider = self._provider()
        with patch("httpx.post", side_effect=httpx.TimeoutException("timeout")):
            r = provider.send("+917483588380", "Alert")
        assert r["success"] is False
        assert "timed out" in r["error"].lower()

    def test_network_exception_returns_failure(self):
        provider = self._provider()
        with patch("httpx.post", side_effect=ConnectionError("Network unreachable")):
            r = provider.send("+917483588380", "Alert")
        assert r["success"] is False
        assert r["error"] is not None

    def test_called_with_correct_args(self):
        provider = self._provider("mykey")
        mock_resp = _mock_httpx_post({"success": True, "textId": 99})
        with patch("httpx.post", return_value=mock_resp) as mock_post:
            provider.send("+917483588380", "Hello driver")
        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args
        data = call_kwargs[1].get("data") or call_kwargs[0][1]  # positional or kwarg
        assert data["phone"] == "+917483588380"
        assert data["message"] == "Hello driver"
        assert data["key"] == "mykey"


# ===========================================================================
# 6. TextbeeProvider — unit tests
# ===========================================================================

class TestTextbeeProvider:

    def _provider(self, device_id: str = "dev001") -> TextbeeProvider:
        return TextbeeProvider("tbkey123", device_id)

    def test_successful_send(self):
        provider = self._provider()
        mock_resp = _mock_httpx_post({"success": True, "data": {"batchId": "batch_abc"}})
        with patch("httpx.post", return_value=mock_resp):
            r = provider.send("+917483588380", "Alert")
        assert r["success"] is True
        assert r["message_id"] == "batch_abc"
        assert r["provider"] == "textbee"
        assert r["mock"] is False

    def test_no_device_id_falls_back_to_api(self):
        """Without a device_id it fetches one from the devices endpoint."""
        provider = TextbeeProvider("tbkey123", None)
        device_resp = MagicMock()
        device_resp.status_code = 200
        device_resp.json.return_value = {"data": [{"_id": "dev_fetched"}]}
        device_resp.raise_for_status = MagicMock()

        send_resp = _mock_httpx_post({"success": True, "data": {"batchId": "b1"}})

        responses = [device_resp, send_resp]
        with patch("httpx.get", return_value=device_resp):
            with patch("httpx.post", return_value=send_resp):
                r = provider.send("+917483588380", "Alert")
        assert r["success"] is True

    def test_no_device_registered_returns_failure(self):
        provider = TextbeeProvider("tbkey123", None)
        device_resp = MagicMock()
        device_resp.status_code = 200
        device_resp.json.return_value = {"data": []}     # empty device list
        device_resp.raise_for_status = MagicMock()
        with patch("httpx.get", return_value=device_resp):
            r = provider.send("+917483588380", "Alert")
        assert r["success"] is False
        assert "device" in r["error"].lower()

    def test_http_error_returns_failure(self):
        import httpx
        provider = self._provider()
        bad_resp = MagicMock()
        bad_resp.status_code = 429
        bad_resp.text = "Rate limit exceeded"
        with patch("httpx.post", side_effect=httpx.HTTPStatusError(
            "HTTP error", request=MagicMock(), response=bad_resp
        )):
            r = provider.send("+917483588380", "Alert")
        assert r["success"] is False
        assert "429" in r["error"]

    def test_timeout_returns_failure(self):
        import httpx
        provider = self._provider()
        with patch("httpx.post", side_effect=httpx.TimeoutException("timeout")):
            r = provider.send("+917483588380", "Alert")
        assert r["success"] is False
        assert "timed out" in r["error"].lower()

    def test_correct_headers_sent(self):
        provider = self._provider("devXYZ")
        mock_resp = _mock_httpx_post({"success": True, "data": {"batchId": "b2"}})
        with patch("httpx.post", return_value=mock_resp) as mock_post:
            provider.send("+917483588380", "Hello")
        call_kw = mock_post.call_args[1]
        assert call_kw["headers"]["x-api-key"] == "tbkey123"
        assert call_kw["json"]["recipients"] == ["+917483588380"]
        assert "devXYZ" in mock_post.call_args[0][0]


# ===========================================================================
# 7. Provider switching via SMS_PROVIDER env var
# ===========================================================================

class TestProviderSwitching:

    def test_mock_is_default(self):
        svc = _make_service("mock")
        assert svc.provider_name == "mock"

    def test_textbelt_provider_selected(self):
        svc = _make_service("textbelt", TEXTBELT_API_KEY="textbelt")
        assert svc.provider_name == "textbelt"

    def test_textbee_provider_selected(self):
        svc = _make_service("textbee", TEXTBEE_API_KEY="realkey")
        assert svc.provider_name == "textbee"

    def test_unknown_provider_falls_back_to_mock(self):
        svc = _make_service("unknown_provider")
        assert svc.provider_name == "mock"

    def test_textbee_without_key_falls_back_to_mock(self):
        svc = _make_service("textbee", TEXTBEE_API_KEY="")
        assert svc.provider_name == "mock"


# ===========================================================================
# 8. send_dispatch_alert high-level helper
# ===========================================================================

class TestSendDispatchAlert:

    def setup_method(self):
        self.svc = _make_service("mock")

    def test_valid_alert_succeeds(self):
        r = self.svc.send_dispatch_alert(
            driver_phone="+917483588380",
            driver_name="Amit Sharma",
            ambulance_id="AMB-105",
            emergency_details="Chest pain",
            pickup_location="Connaught Place",
            priority="HIGH",
        )
        assert r["success"] is True

    def test_missing_phone_fails(self):
        r = self.svc.send_dispatch_alert(
            driver_phone="",
            driver_name="Amit",
            ambulance_id="AMB-105",
            emergency_details="Chest pain",
            pickup_location="AIIMS",
            priority="HIGH",
        )
        assert r["success"] is False
        assert "missing" in r["error"].lower()

    def test_none_phone_fails(self):
        r = self.svc.send_dispatch_alert(
            driver_phone=None,  # type: ignore[arg-type]
            driver_name=None,
            ambulance_id="AMB-105",
            emergency_details="Accident",
            pickup_location="India Gate",
            priority="HIGH",
        )
        assert r["success"] is False

    def test_message_body_contains_key_fields(self):
        captured: list[str] = []
        original = self.svc._provider.send

        def capture(to, body):
            captured.append(body)
            return original(to, body)

        self.svc._provider.send = capture  # type: ignore[method-assign]
        self.svc.send_dispatch_alert(
            driver_phone="+917483588380",
            driver_name="Rahul Singh",
            ambulance_id="AMB-312",
            emergency_details="Stroke",
            pickup_location="Karol Bagh",
            priority="HIGH",
        )
        assert len(captured) == 1
        body = captured[0]
        assert "AMB-312" in body
        assert "Karol Bagh" in body
        assert "Stroke" in body
        assert "HIGH" in body
        assert "Rahul Singh" in body


# ===========================================================================
# 9. Dispatch survives SMS failure (critical requirement)
# ===========================================================================

class TestDispatchSurvivesSmsFailure:

    def _fresh_dispatch_module(self):
        for k in list(sys.modules.keys()):
            if "routers.dispatch" in k:
                del sys.modules[k]
        import routers.dispatch as m  # noqa: PLC0415
        return m

    def _failing_sms(self) -> MagicMock:
        svc = MagicMock()
        svc.send_dispatch_alert.return_value = {
            "success": False, "error": "Provider error",
            "to": "+917483588380", "mock": False,
            "sent_at": "2026-09-11T10:00:00+00:00",
            "message_id": None, "message_sid": None, "status": None,
            "provider": "textbelt",
        }
        return svc

    def _ok_whatsapp(self) -> MagicMock:
        svc = MagicMock()
        svc.send_hospital_assignment.return_value = {
            "success": True, "message_sid": "WA001", "mock": False,
        }
        return svc

    def test_dispatch_created_when_sms_fails(self):
        m = self._fresh_dispatch_module()
        data = {
            "ambulance_id": "AMB-105",
            "hospital_name": "AIIMS New Delhi",
            "hospital_address": "Ansari Nagar, New Delhi",
            "driver_phone": "+917483588380",
            "driver_name": "Amit Sharma",
            "priority": "critical",
            "eta": "7 minutes",
        }
        with (
            patch.object(m, "sms_notification_service", self._failing_sms()),
            patch.object(m, "sms_service", self._ok_whatsapp()),
        ):
            resp = asyncio.run(m.dispatch_ambulance(data))

        assert resp["success"] is True
        assert resp["sms_status"]["sent"] is False
        assert resp["sms_status"]["status"] == "failed"
        assert resp["sms_status"]["error"] is not None
        record = m.dispatches[resp["dispatch_id"]]
        assert record["sms_status"] == "failed"

    def test_dispatch_created_when_sms_succeeds_mock(self):
        m = self._fresh_dispatch_module()
        ok_sms = MagicMock()
        ok_sms.send_dispatch_alert.return_value = {
            "success": True, "error": None, "to": "+918618243016",
            "mock": True, "sent_at": "2026-09-11T10:00:00+00:00",
            "message_id": "MOCK_ID", "message_sid": "MOCK_ID",
            "status": "mock", "provider": "mock",
        }
        data = {
            "ambulance_id": "AMB-208",
            "hospital_name": "Apollo Hospital",
            "hospital_address": "Sarita Vihar, New Delhi",
            "driver_phone": "+918618243016",
            "priority": "high",
            "eta": "5 minutes",
        }
        with (
            patch.object(m, "sms_notification_service", ok_sms),
            patch.object(m, "sms_service", self._ok_whatsapp()),
        ):
            resp = asyncio.run(m.dispatch_ambulance(data))

        assert resp["success"] is True
        assert resp["sms_status"]["status"] == "mock"
        assert m.dispatches[resp["dispatch_id"]]["sms_mock"] is True

    def test_missing_required_fields_raises_400(self):
        from fastapi import HTTPException  # noqa: PLC0415
        m = self._fresh_dispatch_module()
        with pytest.raises(HTTPException) as exc:
            asyncio.run(m.dispatch_ambulance({"ambulance_id": "AMB-105"}))
        assert exc.value.status_code == 400


# ===========================================================================
# 10. SMS status endpoint
# ===========================================================================

class TestSmsStatusEndpoint:

    def _fresh_dispatch_module(self):
        for k in list(sys.modules.keys()):
            if "routers.dispatch" in k:
                del sys.modules[k]
        import routers.dispatch as m  # noqa: PLC0415
        return m

    def test_masked_phone_returned(self):
        m = self._fresh_dispatch_module()
        m.dispatches["DSP-TEST"] = {
            "dispatch_id": "DSP-TEST",
            "ambulance_id": "AMB-105",
            "driver_name": "Amit Sharma",
            "driver_phone": "+917483588380",
            "sms_status": "sent",
            "sms_sent_at": "2026-09-11T10:00:00+00:00",
            "sms_message_id": "tb_123",
            "sms_error": None,
            "sms_mock": False,
        }
        result = asyncio.run(m.get_sms_status("DSP-TEST"))
        assert result["sms_status"] == "sent"
        assert result["driver_phone_masked"] != "+917483588380"
        assert result["driver_phone_masked"].endswith("8380")
        assert "+" not in result["driver_phone_masked"]

    def test_404_for_unknown(self):
        from fastapi import HTTPException  # noqa: PLC0415
        m = self._fresh_dispatch_module()
        with pytest.raises(HTTPException) as exc:
            asyncio.run(m.get_sms_status("DSP-NOPE"))
        assert exc.value.status_code == 404


# ===========================================================================
# 11. Credentials never logged
# ===========================================================================

class TestCredentialSafety:

    def test_api_keys_not_in_logs(self, caplog):
        import logging  # noqa: PLC0415
        secret_key = "super_secret_textbelt_key_99"
        with (
            patch.dict("os.environ", {
                "SMS_PROVIDER": "textbelt",
                "TEXTBELT_API_KEY": secret_key,
            }),
            caplog.at_level(logging.DEBUG, logger="services.sms_notification_service"),
        ):
            svc = SMSNotificationService()
            # Trigger a send to generate more log output
            mock_resp = _mock_httpx_post({"success": True, "textId": 1})
            with patch("httpx.post", return_value=mock_resp):
                svc.send_sms("+917483588380", "Test")

        for record in caplog.records:
            assert secret_key not in record.message, (
                f"Secret key found in log: {record.message}"
            )

    def test_textbee_key_not_in_logs(self, caplog):
        import logging  # noqa: PLC0415
        secret_key = "textbee_supersecret_key"
        with (
            patch.dict("os.environ", {
                "SMS_PROVIDER": "textbee",
                "TEXTBEE_API_KEY": secret_key,
                "TEXTBEE_DEVICE_ID": "dev001",
            }),
            caplog.at_level(logging.DEBUG, logger="services.sms_notification_service"),
        ):
            svc = SMSNotificationService()
            mock_resp = _mock_httpx_post({"success": True, "data": {"batchId": "b1"}})
            with patch("httpx.post", return_value=mock_resp):
                svc.send_sms("+917483588380", "Test")

        for record in caplog.records:
            assert secret_key not in record.message
