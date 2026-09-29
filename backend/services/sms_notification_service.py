"""
SMS Notification Service — SARS (Smart Ambulance Routing System)
================================================================
Provider-agnostic SMS layer.  Switch providers by setting SMS_PROVIDER
in your .env file — no application code changes needed.

Supported providers
-------------------
  mock      – Logs to console only; no network calls (default for dev)
  textbelt  – https://textbelt.com  — 1 free SMS/day, zero signup
              Set TEXTBELT_API_KEY=textbelt  (literal string "textbelt")
              Buy a key at textbelt.com for more volume ($)
  textbee   – https://textbee.dev   — 300 SMS/month free, permanently
              Requires an Android phone running the textbee app as gateway
              Set TEXTBEE_API_KEY=<your key from textbee.dev dashboard>

Environment variables
---------------------
  SMS_PROVIDER        textbelt | textbee | mock   (default: mock)
  TEXTBELT_API_KEY    "textbelt" for the free tier; or a paid key
  TEXTBEE_API_KEY     API key from your textbee.dev dashboard
  TEXTBEE_DEVICE_ID   (optional) pin a specific gateway Android device
  TRACKING_BASE_URL   Base URL for the live-tracking link in the SMS body
                      e.g. http://localhost:3000

How Textbelt free tier works
-----------------------------
  * key=textbelt  →  1 free SMS per day, to ANY phone number worldwide
  * No account, no credit card, no signup
  * Append _test to the key (key=textbelt_test) to validate without
    consuming the daily quota
  * Paid keys start at $0.009/text

How textbee free tier works
----------------------------
  * 300 messages/month (sent + received), 50/day — permanently free
  * Sends via YOUR own Android phone's SIM card
  * No trial prefix on messages; recipients see your real number
  * Requires: install the textbee APK, link phone in dashboard, get API key

Provider comparison
-------------------
  Provider   Free limit     Signup   Restriction           Best for
  -------    ----------     ------   -----------           --------
  mock       unlimited      none     console-only          local dev / CI
  textbelt   1/day          none     none                  quick tests
  textbee    300/month      yes      needs Android device  production-like dev
"""

from __future__ import annotations

import abc
import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Phone-number helpers  (shared by all providers)
# ---------------------------------------------------------------------------

_E164_RE = re.compile(r"^\+[1-9]\d{6,14}$")


def _is_valid_e164(phone: str) -> bool:
    return bool(_E164_RE.match(phone.strip()))


def _normalise_phone(phone: str) -> str:
    """
    Best-effort normalisation to E.164.
    +917483588380  → +917483588380   (already valid)
    917483588380   → +917483588380   (missing +)
    9876543210     → +919876543210   (10-digit Indian number)
    00917483588380 → +917483588380   (00 prefix)
    """
    if not phone:
        return ""
    s = re.sub(r"[\s\-().]+", "", phone)
    if s.startswith("+"):
        return s
    if s.startswith("00"):
        return "+" + s[2:]
    if re.match(r"^\d{10}$", s):       # 10-digit → assume India +91
        return "+91" + s
    if len(s) >= 11 and s.isdigit():
        return "+" + s
    return s


# ---------------------------------------------------------------------------
# Shared result factory
# ---------------------------------------------------------------------------

def _result(
    success: bool,
    *,
    provider: str = "unknown",
    message_id: Optional[str] = None,
    status: Optional[str] = None,
    to: Optional[str] = None,
    error: Optional[str] = None,
    mock: bool = False,
) -> dict[str, Any]:
    return {
        "success": success,
        "provider": provider,
        "message_id": message_id,
        # Keep legacy key name so dispatch.py response shape stays stable
        "message_sid": message_id,
        "status": status,
        "to": to,
        "error": error,
        "mock": mock,
        "sent_at": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Abstract provider base
# ---------------------------------------------------------------------------

class SMSProvider(abc.ABC):
    """All concrete providers implement exactly this interface."""

    @property
    @abc.abstractmethod
    def name(self) -> str: ...

    @abc.abstractmethod
    def send(self, to: str, body: str) -> dict[str, Any]:
        """
        Send *body* to *to* (E.164 phone number).
        Must return a result dict (use _result() factory).
        Must never raise — catch all exceptions internally.
        """


# ---------------------------------------------------------------------------
# MockProvider  (SMS_PROVIDER=mock — default)
# ---------------------------------------------------------------------------

class MockProvider(SMSProvider):
    """
    Logs the message to console.  No network call.  Dispatch still works.
    Use this for local development and CI.
    """

    @property
    def name(self) -> str:
        return "mock"

    def send(self, to: str, body: str) -> dict[str, Any]:
        logger.info(
            "[SMS][MOCK] Would send to %s:\n%s", to, body
        )
        return _result(
            True,
            provider=self.name,
            message_id="MOCK_ID",
            status="mock",
            to=to,
            mock=True,
        )


# ---------------------------------------------------------------------------
# TextbeltProvider  (SMS_PROVIDER=textbelt)
# ---------------------------------------------------------------------------

class TextbeltProvider(SMSProvider):
    """
    Textbelt  https://textbelt.com
    --------------------------------
    Free tier : key=textbelt  →  1 SMS per day to any number
    Test mode : append _test to the key (e.g. textbelt_test) — no quota used
    Paid keys : buy at textbelt.com for more volume

    Setup (zero signup for free tier):
      TEXTBELT_API_KEY=textbelt          # literally the word "textbelt"
      SMS_PROVIDER=textbelt
    """

    _ENDPOINT = "https://textbelt.com/text"

    def __init__(self, api_key: str) -> None:
        self._key = api_key.strip()

    @property
    def name(self) -> str:
        return "textbelt"

    @property
    def is_test_key(self) -> bool:
        return self._key.endswith("_test")

    def send(self, to: str, body: str) -> dict[str, Any]:
        try:
            resp = httpx.post(
                self._ENDPOINT,
                data={"phone": to, "message": body, "key": self._key},
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()

            if data.get("success"):
                text_id = str(data.get("textId", ""))
                quota = data.get("quotaRemaining")
                logger.info(
                    "[SMS][Textbelt] Sent to %s — textId=%s quota_remaining=%s",
                    to, text_id, quota,
                )
                return _result(
                    True,
                    provider=self.name,
                    message_id=text_id,
                    status="queued",
                    to=to,
                    mock=self.is_test_key,
                )
            else:
                err = data.get("error", "Unknown Textbelt error")
                logger.warning("[SMS][Textbelt] Send failed to %s: %s", to, err)
                return _result(False, provider=self.name, error=err, to=to)

        except httpx.TimeoutException:
            msg = "Textbelt request timed out"
            logger.error("[SMS][Textbelt] %s", msg)
            return _result(False, provider=self.name, error=msg, to=to)
        except Exception as exc:
            logger.error("[SMS][Textbelt] Unexpected error: %s", exc)
            return _result(False, provider=self.name, error=str(exc), to=to)


# ---------------------------------------------------------------------------
# TextbeeProvider  (SMS_PROVIDER=textbee)
# ---------------------------------------------------------------------------

class TextbeeProvider(SMSProvider):
    """
    textbee  https://textbee.dev
    --------------------------------
    Free tier : 300 SMS/month, 50/day — permanently free, no credit card
    Gateway   : your own Android phone with the textbee APK installed
    Sends to  : ANY phone number (no verification step, no trial prefix)

    Setup:
      1. Go to https://app.textbee.dev/  and create a free account
      2. Install the APK on an Android phone with a working SIM
      3. Scan the QR code in the dashboard to link the device
      4. Create an API key in the dashboard
      Then set:
        TEXTBEE_API_KEY=<your key>
        TEXTBEE_DEVICE_ID=<device id from dashboard>  (optional — uses first device if omitted)
        SMS_PROVIDER=textbee

    API reference: https://docs.textbee.dev/http-api/send-sms
    """

    _BASE = "https://api.textbee.dev/api/v1"

    def __init__(self, api_key: str, device_id: Optional[str] = None) -> None:
        self._key = api_key.strip()
        self._device_id = (device_id or "").strip() or None

    @property
    def name(self) -> str:
        return "textbee"

    def send(self, to: str, body: str) -> dict[str, Any]:
        try:
            # Resolve device id — use provided or fetch first available
            device_id = self._device_id or self._get_first_device_id()
            if not device_id:
                err = "No textbee device registered. Link an Android device in the textbee dashboard."
                logger.error("[SMS][textbee] %s", err)
                return _result(False, provider=self.name, error=err, to=to)

            url = f"{self._BASE}/gateway/devices/{device_id}/sendSMS"
            payload = {"recipients": [to], "message": body}
            headers = {"x-api-key": self._key}

            resp = httpx.post(url, json=payload, headers=headers, timeout=15)
            resp.raise_for_status()
            data = resp.json()

            # textbee returns { success: true, data: { batchId: "..." } }
            batch_id = (
                data.get("data", {}).get("batchId")
                or data.get("batchId")
                or data.get("id")
                or "unknown"
            )
            logger.info(
                "[SMS][textbee] Sent to %s — batchId=%s", to, batch_id
            )
            return _result(
                True,
                provider=self.name,
                message_id=str(batch_id),
                status="queued",
                to=to,
            )

        except httpx.HTTPStatusError as exc:
            err = f"textbee HTTP {exc.response.status_code}: {exc.response.text[:200]}"
            logger.error("[SMS][textbee] %s", err)
            return _result(False, provider=self.name, error=err, to=to)
        except httpx.TimeoutException:
            msg = "textbee request timed out"
            logger.error("[SMS][textbee] %s", msg)
            return _result(False, provider=self.name, error=msg, to=to)
        except Exception as exc:
            logger.error("[SMS][textbee] Unexpected error: %s", exc)
            return _result(False, provider=self.name, error=str(exc), to=to)

    def _get_first_device_id(self) -> Optional[str]:
        """Fetch the first registered device id from the textbee API."""
        try:
            resp = httpx.get(
                f"{self._BASE}/gateway/devices",
                headers={"x-api-key": self._key},
                timeout=10,
            )
            resp.raise_for_status()
            devices = resp.json().get("data", [])
            if devices:
                return str(devices[0].get("_id") or devices[0].get("id", ""))
        except Exception as exc:
            logger.warning("[SMS][textbee] Could not fetch devices: %s", exc)
        return None


# ---------------------------------------------------------------------------
# SMS Notification Service  (public interface used by dispatch router)
# ---------------------------------------------------------------------------

class SMSNotificationService:
    """
    Provider-agnostic SMS service.

    The provider is chosen at startup via the SMS_PROVIDER env var:
      mock      → MockProvider       (default — logs only, no network)
      textbelt  → TextbeltProvider   (1 free SMS/day, zero signup)
      textbee   → TextbeeProvider    (300 free SMS/month, needs Android device)

    All public methods return a result dict and never raise.

    Public API
    ----------
    send_sms(to, message)          – low-level: send one message
    send_dispatch_alert(...)       – high-level: format + send dispatch SMS
    format_emergency_sms(...)      – build the standard message body
    """

    def __init__(self) -> None:
        provider_name = os.getenv("SMS_PROVIDER", "mock").strip().lower()
        self.tracking_base_url = os.getenv(
            "TRACKING_BASE_URL", "http://localhost:3000"
        ).rstrip("/")

        self._provider: SMSProvider = self._build_provider(provider_name)
        logger.info(
            "[SMS] Initialised with provider '%s'.", self._provider.name
        )

    # ---------------------------------------------------------------- factory
    @staticmethod
    def _build_provider(name: str) -> SMSProvider:
        if name == "textbelt":
            key = os.getenv("TEXTBELT_API_KEY", "textbelt").strip()
            if not key:
                logger.warning(
                    "[SMS] TEXTBELT_API_KEY not set — defaulting to free key 'textbelt' "
                    "(1 SMS/day). Set TEXTBELT_API_KEY=textbelt in .env."
                )
                key = "textbelt"
            logger.info(
                "[SMS][Textbelt] Using key '%s%s'.",
                key[:8], "…" if len(key) > 8 else "",
            )
            return TextbeltProvider(key)

        if name == "textbee":
            key = os.getenv("TEXTBEE_API_KEY", "").strip()
            device_id = os.getenv("TEXTBEE_DEVICE_ID", "").strip() or None
            if not key:
                logger.error(
                    "[SMS] SMS_PROVIDER=textbee but TEXTBEE_API_KEY is not set. "
                    "Falling back to MockProvider. "
                    "Get a free key at https://app.textbee.dev/"
                )
                return MockProvider()
            return TextbeeProvider(key, device_id)

        if name != "mock":
            logger.warning(
                "[SMS] Unknown SMS_PROVIDER '%s' — using MockProvider. "
                "Valid values: mock, textbelt, textbee.", name
            )
        return MockProvider()

    # -------------------------------------------------------- properties
    @property
    def provider_name(self) -> str:
        return self._provider.name

    @property
    def is_mock(self) -> bool:
        return self._provider.name == "mock"

    # -------------------------------------------------------- message formatting
    def format_emergency_sms(
        self,
        *,
        ambulance_id: str,
        emergency_details: str,
        pickup_location: str,
        priority: str,
        tracking_link: Optional[str] = None,
        driver_name: Optional[str] = None,
    ) -> str:
        """
        Build the standard emergency dispatch SMS body.
        No sensitive patient PII — only actionable dispatch info.
        """
        if tracking_link is None:
            tracking_link = (
                f"{self.tracking_base_url}/track?ambulance={ambulance_id}"
            )

        greeting = f"Driver {driver_name}, " if driver_name else ""
        priority_upper = (priority or "HIGH").upper()

        return (
            f"EMERGENCY ALERT\n"
            f"{greeting}Ambulance {ambulance_id} assigned.\n"
            f"Emergency: {emergency_details}\n"
            f"Pickup: {pickup_location}\n"
            f"Priority: {priority_upper}\n"
            f"Proceed immediately.\n"
            f"Tracking: {tracking_link}"
        )

    # -------------------------------------------------------- core send
    def send_sms(self, driver_phone_number: str, message: str) -> dict[str, Any]:
        """
        Send *message* to *driver_phone_number*.

        Validates the phone number, normalises it to E.164, then delegates
        to the configured provider.  Never raises.
        """
        # ---- input validation -------------------------------------------
        if not driver_phone_number or not str(driver_phone_number).strip():
            logger.warning("[SMS] Driver phone number missing — SMS not sent.")
            return _result(
                False, provider=self.provider_name,
                error="Driver phone number is missing",
                to=driver_phone_number,
            )

        if not message or not message.strip():
            logger.warning("[SMS] Empty message body — SMS not sent.")
            return _result(
                False, provider=self.provider_name,
                error="Message body is empty",
                to=driver_phone_number,
            )

        normalised = _normalise_phone(str(driver_phone_number).strip())
        if not _is_valid_e164(normalised):
            logger.warning(
                "[SMS] Invalid phone number '%s' (normalised: '%s').",
                driver_phone_number, normalised,
            )
            return _result(
                False, provider=self.provider_name,
                error=f"Invalid phone number format: '{driver_phone_number}'",
                to=driver_phone_number,
            )

        return self._provider.send(normalised, message)

    # -------------------------------------------------------- high-level helper
    def send_dispatch_alert(
        self,
        *,
        driver_phone: str,
        driver_name: Optional[str],
        ambulance_id: str,
        emergency_details: str,
        pickup_location: str,
        priority: str,
        tracking_link: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Format and send the standard emergency dispatch alert.
        Missing phone number returns a failure result without raising.
        """
        if not driver_phone or not str(driver_phone).strip():
            logger.warning(
                "[SMS] Driver phone missing for ambulance %s.", ambulance_id
            )
            return _result(
                False, provider=self.provider_name,
                error="Driver phone number is missing",
                to=driver_phone,
            )

        body = self.format_emergency_sms(
            ambulance_id=ambulance_id,
            emergency_details=emergency_details,
            pickup_location=pickup_location,
            priority=priority,
            tracking_link=tracking_link,
            driver_name=driver_name,
        )
        return self.send_sms(driver_phone, body)


# ---------------------------------------------------------------------------
# Module-level singleton — import this in routers
# ---------------------------------------------------------------------------
sms_notification_service = SMSNotificationService()
