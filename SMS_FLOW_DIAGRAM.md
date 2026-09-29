# SMS Notification Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SARS SMS Notification Flow                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Operator   │  1. Emergency call received
│  Dashboard   │     Audio transcribed by AI
└──────┬───────┘
       │
       │ 2. Reviews patient details
       │    Selects ambulance on map
       │    Enters hospital destination
       ▼
┌──────────────┐
│  Dispatch    │  3. Fills dispatch form:
│    Form      │     • Hospital Name: "AIIMS Hospital"
│              │     • Hospital Address: "Sri Aurobindo Marg..."
│              │     • Driver Phone: "+919876543210" (auto-filled)
└──────┬───────┘     • Patient Info, ETA, etc.
       │
       │ 4. Clicks "Dispatch Ambulance"
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                                │
│                                                                          │
│  POST /api/dispatch/                                                     │
│  {                                                                       │
│    "ambulance_id": "AMB-001",                                           │
│    "hospital_name": "AIIMS Hospital",                                   │
│    "hospital_address": "Sri Aurobindo Marg, New Delhi",                 │
│    "driver_phone": "+919876543210",                                     │
│    "patient_info": "Male, 45 years, chest pain",                        │
│    "eta": "12 minutes"                                                  │
│  }                                                                       │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
                               │ 5. HTTP POST request
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI + Python)                           │
│                                                                          │
│  dispatch.py router:                                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ 1. Validate required fields                                    │    │
│  │ 2. Generate dispatch ID                                        │    │
│  │ 3. Call SMS Service ────────────┐                              │    │
│  │ 4. Store dispatch info          │                              │    │
│  │ 5. Return response              │                              │    │
│  └────────────────────────────────┬┴──────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  sms_service.py:                                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ 1. Check if Twilio configured                                  │    │
│  │ 2. Format SMS message:                                         │    │
│  │    "🚨 HOSPITAL ASSIGNMENT - AMB-001                           │    │
│  │     🏥 DESTINATION: AIIMS Hospital                             │    │
│  │     📍 ADDRESS: Sri Aurobindo Marg..."                         │    │
│  │ 3. Send via Twilio API ──────────────┐                         │    │
│  │ 4. Return status                     │                         │    │
│  └──────────────────────────────────────┼─────────────────────────┘    │
└─────────────────────────────────────────┼──────────────────────────────┘
                                          │
                                          │ 6. HTTPS POST to Twilio
                                          ▼
                            ┌──────────────────────────┐
                            │      Twilio Cloud        │
                            │   (SMS Gateway Service)  │
                            │                          │
                            │  1. Validates request    │
                            │  2. Queues message       │
                            │  3. Routes to carrier    │
                            │  4. Returns Message SID  │
                            └────────────┬─────────────┘
                                         │
                                         │ 7. SMS sent via carrier network
                                         ▼
                            ┌──────────────────────────┐
                            │   Driver's Phone 📱      │
                            │                          │
                            │  🚨 HOSPITAL ASSIGNMENT  │
                            │     - AMB-001            │
                            │                          │
                            │  🏥 AIIMS Hospital       │
                            │  📍 Sri Aurobindo Marg   │
                            │  👤 Male, 45 years       │
                            │  ⏱️ ETA: 12 minutes      │
                            │                          │
                            │  ⚠️ Please acknowledge   │
                            └──────────────────────────┘
                                         │
                                         │ 8. Driver reads message
                                         │    and proceeds to hospital
                                         ▼
                            ┌──────────────────────────┐
                            │   Driver navigates to    │
                            │   AIIMS Hospital with    │
                            │   patient information    │
                            └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         Response Flow (back to operator)                    │
└─────────────────────────────────────────────────────────────────────────────┘

Backend Response ──────────────────────────► Frontend Display
{                                             ┌────────────────────┐
  "success": true,                            │  ✅ Success Alert  │
  "dispatch_id": "DSP-001",                   │                    │
  "ambulance_id": "AMB-001",                  │  Ambulance AMB-001 │
  "hospital_name": "AIIMS Hospital",          │  dispatched to     │
  "eta": "12 minutes",                        │  AIIMS Hospital    │
  "sms_status": {                             │                    │
    "sent": true,                             │  📱 SMS sent to    │
    "message_sid": "SM123...",                │  driver            │
    "error": null                             │                    │
  }                                           └────────────────────┘
}

┌─────────────────────────────────────────────────────────────────────────────┐
│                         Optional: Send Updates                              │
└─────────────────────────────────────────────────────────────────────────────┘

Operator sends update ──► POST /api/dispatch/DSP-001/send-update
                          {
                            "update_type": "ROUTE_CHANGE",
                            "details": "Take alternate route via NH-44"
                          }
                          │
                          ▼
                     SMS Service ──► Twilio ──► Driver's Phone 📱
                                                 
                                                 🚨 ROUTE_CHANGE - AMB-001
                                                 
                                                 Take alternate route via NH-44
                                                 
                                                 Please acknowledge and take
                                                 necessary action.

┌─────────────────────────────────────────────────────────────────────────────┐
│                              Error Handling                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Scenario 1: Twilio Not Configured
├─► SMS Service detects missing credentials
├─► Returns: { "success": false, "error": "Twilio not configured", "mock": true }
├─► Dispatch still succeeds (non-blocking)
└─► Operator sees warning: "SMS not sent (development mode)"

Scenario 2: Invalid Phone Number
├─► Twilio API returns error
├─► Returns: { "success": false, "error": "Invalid phone number" }
├─► Dispatch still succeeds (non-blocking)
└─► Operator sees error message with details

Scenario 3: Network/Twilio Error
├─► Exception caught in SMS Service
├─► Returns: { "success": false, "error": "Connection timeout" }
├─► Dispatch still succeeds (non-blocking)
└─► Operator can retry or contact driver manually

```

## Key Components

1. **Frontend**: React form with hospital and driver phone fields
2. **Backend API**: FastAPI endpoints for dispatch management
3. **SMS Service**: Twilio integration for message delivery
4. **Twilio Cloud**: Third-party SMS gateway
5. **Mobile Network**: Carrier delivers SMS to driver

## Data Flow Summary

1. Operator submits dispatch form
2. Frontend sends HTTP POST to backend
3. Backend validates data and calls SMS service
4. SMS service formats message and calls Twilio API
5. Twilio routes message through mobile carrier
6. Driver receives SMS on phone
7. Backend returns status to frontend
8. Operator sees confirmation

## Non-Blocking Design

- SMS failures don't prevent dispatch creation
- Graceful degradation when Twilio unavailable
- Clear error messages for troubleshooting
- Development mode works without credentials
