"""
Dispatch Router
===============
Handles ambulance dispatch requests and driver SMS notifications.

Workflow
--------
1. Validate required fields (ambulance_id, hospital_name, hospital_address, driver_phone).
2. Send WhatsApp notification (existing behaviour — via sms_service / WhatsAppService).
3. Send SMS notification to driver (new — via sms_notification_service).
4. Store the full dispatch record including SMS tracking fields.
5. Return a unified response that includes both WhatsApp and SMS statuses.

SMS tracking fields added to every dispatch record
---------------------------------------------------
  sms_status     : "sent" | "failed" | "pending" | "mock"
  sms_sent_at    : ISO-8601 timestamp or None
  sms_message_id : Twilio message SID or None
  sms_error      : error description string or None
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

# ── existing WhatsApp service (keep untouched) ────────────────────────────────
try:
    from ..services.sms_service import sms_service
except ImportError:  # pragma: no cover
    from services.sms_service import sms_service  # type: ignore[no-redef]

# ── new SMS notification service ──────────────────────────────────────────────
try:
    from ..services.sms_notification_service import sms_notification_service
except ImportError:  # pragma: no cover
    from services.sms_notification_service import sms_notification_service  # type: ignore[no-redef]

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory dispatch store (replace with a database in production)
dispatches: Dict[str, Dict[str, Any]] = {}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _priority_label(raw: Any) -> str:
    """Normalise a priority value to HIGH / MEDIUM / LOW for the SMS."""
    mapping = {
        "critical": "HIGH",
        "high": "HIGH",
        "medium": "MEDIUM",
        "low": "LOW",
        1: "HIGH",
        2: "HIGH",
        3: "MEDIUM",
        4: "LOW",
    }
    if isinstance(raw, str):
        return mapping.get(raw.lower(), "HIGH")
    return mapping.get(raw, "HIGH")


def _sms_status_from_result(result: dict) -> str:
    """Convert an sms_notification_service result dict to a status label."""
    if not result.get("success"):
        return "failed"
    if result.get("mock"):
        return "mock"
    return "sent"


# ---------------------------------------------------------------------------
# POST /  — create a new dispatch
# ---------------------------------------------------------------------------

@router.post("/")
async def dispatch_ambulance(dispatch_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Dispatch an ambulance to an emergency.

    Required fields
    ---------------
    ambulance_id    – ID of the ambulance (e.g. "AMB-105")
    hospital_name   – Destination hospital name
    hospital_address – Destination hospital address
    driver_phone    – Driver's phone number (E.164 preferred, e.g. +917483588380)

    Optional fields
    ---------------
    emergency_id    – Links this dispatch to an emergency record
    patient_info    – Brief, non-sensitive patient description
    pickup_location – Pickup address/landmark (defaults to hospital_address)
    priority        – "critical" | "high" | "medium" | "low"  (default: "high")
    eta             – ETA string (e.g. "8 minutes")
    driver_name     – Driver's name (used in SMS greeting)
    """
    ambulance_id   = dispatch_data.get("ambulance_id")
    hospital_name  = dispatch_data.get("hospital_name")
    hospital_addr  = dispatch_data.get("hospital_address")
    driver_phone   = dispatch_data.get("driver_phone", "")
    driver_name    = dispatch_data.get("driver_name")
    patient_info   = dispatch_data.get("patient_info", "Emergency in progress")
    pickup_loc     = dispatch_data.get("pickup_location") or hospital_addr or "Location pending"
    priority_raw   = dispatch_data.get("priority", "high")
    eta            = dispatch_data.get("eta", "8 minutes")
    emergency_id   = dispatch_data.get("emergency_id")

    # ── validate required fields ──────────────────────────────────────────────
    missing = [
        f for f, v in [
            ("ambulance_id", ambulance_id),
            ("hospital_name", hospital_name),
            ("hospital_address", hospital_addr),
            ("driver_phone",   driver_phone),
        ]
        if not v
    ]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields: {', '.join(missing)}",
        )

    dispatch_id = f"DSP-{len(dispatches) + 1:03d}"
    now_iso     = datetime.now(timezone.utc).isoformat()

    # ── Step 1: send WhatsApp notification (existing behaviour) ───────────────
    logger.info("[Dispatch %s] Sending WhatsApp notification…", dispatch_id)
    whatsapp_result = sms_service.send_hospital_assignment(
        driver_phone=driver_phone,
        ambulance_id=ambulance_id,
        hospital_name=hospital_name,
        hospital_address=hospital_addr,
        patient_info=patient_info,
        eta=eta,
        driver_name=driver_name,
    )

    # ── Step 2: send SMS notification (new) ───────────────────────────────────
    logger.info("[Dispatch %s] Sending SMS notification to driver…", dispatch_id)
    priority_label = _priority_label(priority_raw)
    sms_result = sms_notification_service.send_dispatch_alert(
        driver_phone=driver_phone,
        driver_name=driver_name,
        ambulance_id=ambulance_id,
        emergency_details=patient_info,
        pickup_location=pickup_loc,
        priority=priority_label,
    )

    sms_status = _sms_status_from_result(sms_result)
    if sms_status == "sent":
        logger.info(
            "[Dispatch %s] SMS sent successfully to driver (SID: %s).",
            dispatch_id,
            sms_result.get("message_sid"),
        )
    elif sms_status == "mock":
        logger.info(
            "[Dispatch %s] SMS in mock/test mode — no real message sent.",
            dispatch_id,
        )
    else:
        logger.warning(
            "[Dispatch %s] SMS failed: %s — dispatch continues.",
            dispatch_id,
            sms_result.get("error"),
        )

    # ── Step 3: persist dispatch record ──────────────────────────────────────
    dispatches[dispatch_id] = {
        "dispatch_id":    dispatch_id,
        "ambulance_id":   ambulance_id,
        "emergency_id":   emergency_id,
        "hospital_name":  hospital_name,
        "hospital_address": hospital_addr,
        "driver_phone":   driver_phone,
        "driver_name":    driver_name,
        "patient_info":   patient_info,
        "pickup_location": pickup_loc,
        "priority":       priority_raw,
        "eta":            eta,
        "status":         "dispatched",
        "created_at":     now_iso,

        # WhatsApp tracking (existing)
        "whatsapp_sent":  whatsapp_result.get("success", False),
        "whatsapp_sid":   whatsapp_result.get("message_sid"),
        "whatsapp_error": whatsapp_result.get("error"),

        # SMS tracking (new)
        "sms_status":     sms_status,
        "sms_sent_at":    sms_result.get("sent_at") if sms_status in ("sent", "mock") else None,
        "sms_message_id": sms_result.get("message_sid"),
        "sms_error":      sms_result.get("error"),
        "sms_to":         sms_result.get("to"),
        "sms_mock":       sms_result.get("mock", False),
    }

    # ── Step 4: build response ────────────────────────────────────────────────
    return {
        "success":      True,
        "message":      "Ambulance dispatched successfully",
        "dispatch_id":  dispatch_id,
        "ambulance_id": ambulance_id,
        "emergency_id": emergency_id,
        "hospital_name": hospital_name,
        "eta":          eta,

        # WhatsApp status (existing shape — frontend depends on this)
        "whatsapp_status": {
            "sent":        whatsapp_result.get("success", False),
            "message_sid": whatsapp_result.get("message_sid"),
            "error": whatsapp_result.get("error") if not whatsapp_result.get("success") else None,
        },

        # SMS status (new)
        "sms_status": {
            "sent":        sms_status == "sent",
            "status":      sms_status,           # "sent" | "failed" | "pending" | "mock"
            "message_id":  sms_result.get("message_sid"),
            "sent_at":     sms_result.get("sent_at"),
            "to":          sms_result.get("to"),
            "mock":        sms_result.get("mock", False),
            "error":       sms_result.get("error"),
        },
    }


# ---------------------------------------------------------------------------
# GET /{dispatch_id}  — fetch a single dispatch record
# ---------------------------------------------------------------------------

@router.get("/{dispatch_id}")
async def get_dispatch_status(dispatch_id: str) -> Dict[str, Any]:
    """Return the full status of a dispatch, including SMS tracking fields."""
    dispatch = dispatches.get(dispatch_id)
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")

    return {
        "dispatch_id":    dispatch_id,
        "status":         dispatch.get("status", "en_route"),
        "ambulance_id":   dispatch.get("ambulance_id"),
        "hospital_name":  dispatch.get("hospital_name"),
        "hospital_address": dispatch.get("hospital_address"),
        "eta":            dispatch.get("eta", "5 minutes"),
        "driver_name":    dispatch.get("driver_name"),
        "driver_phone":   dispatch.get("driver_phone"),
        "created_at":     dispatch.get("created_at"),

        # WhatsApp status
        "whatsapp_sent":  dispatch.get("whatsapp_sent", False),

        # SMS tracking fields
        "sms_status":     dispatch.get("sms_status", "pending"),
        "sms_sent_at":    dispatch.get("sms_sent_at"),
        "sms_message_id": dispatch.get("sms_message_id"),
        "sms_error":      dispatch.get("sms_error"),
        "sms_mock":       dispatch.get("sms_mock", False),

        "current_location": {
            "latitude":  28.6139,
            "longitude": 77.2090,
        },
    }


# ---------------------------------------------------------------------------
# GET /{dispatch_id}/sms-status  — dedicated SMS status endpoint
# ---------------------------------------------------------------------------

@router.get("/{dispatch_id}/sms-status")
async def get_sms_status(dispatch_id: str) -> Dict[str, Any]:
    """
    Return only the SMS notification status for a dispatch.

    Useful for polling from the frontend dashboard without fetching the full
    dispatch record.
    """
    dispatch = dispatches.get(dispatch_id)
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")

    # Mask all but the last 4 digits of the phone number for privacy
    raw_phone: str = dispatch.get("driver_phone", "")
    masked_phone = (
        ("*" * (len(raw_phone) - 4) + raw_phone[-4:]) if len(raw_phone) > 4 else "****"
    )

    return {
        "dispatch_id":    dispatch_id,
        "ambulance_id":   dispatch.get("ambulance_id"),
        "driver_name":    dispatch.get("driver_name"),
        "driver_phone_masked": masked_phone,
        "sms_status":     dispatch.get("sms_status", "pending"),
        "sms_sent_at":    dispatch.get("sms_sent_at"),
        "sms_message_id": dispatch.get("sms_message_id"),
        "sms_error":      dispatch.get("sms_error"),
        "sms_mock":       dispatch.get("sms_mock", False),
    }


# ---------------------------------------------------------------------------
# POST /{dispatch_id}/send-update  — push a route/priority update to driver
# ---------------------------------------------------------------------------

@router.post("/{dispatch_id}/send-update")
async def send_dispatch_update(
    dispatch_id: str, update_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Send a WhatsApp update message to the driver for an existing dispatch.

    Body fields
    -----------
    update_type : e.g. "ROUTE_CHANGE", "PRIORITY_UPDATE"
    details     : free-text update message
    """
    dispatch = dispatches.get(dispatch_id)
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")

    update_type = update_data.get("update_type", "UPDATE")
    details     = update_data.get("details", "")

    if not details:
        raise HTTPException(status_code=400, detail="Update details are required")

    whatsapp_result = sms_service.send_emergency_update(
        driver_phone=dispatch.get("driver_phone"),
        ambulance_id=dispatch.get("ambulance_id"),
        update_type=update_type,
        details=details,
    )

    return {
        "success": True,
        "message": "Update sent to driver via WhatsApp",
        "dispatch_id": dispatch_id,
        "whatsapp_status": {
            "sent":        whatsapp_result.get("success", False),
            "message_sid": whatsapp_result.get("message_sid"),
            "error": whatsapp_result.get("error") if not whatsapp_result.get("success") else None,
        },
    }


# ---------------------------------------------------------------------------
# GET /  — list all dispatches
# ---------------------------------------------------------------------------

@router.get("/")
async def get_all_dispatches() -> Dict[str, Any]:
    """Return all dispatch records with their SMS tracking fields."""
    return {
        "dispatches": list(dispatches.values()),
        "total":      len(dispatches),
    }
