# Twilio SMS Integration for SARS

This document explains how to set up and use the Twilio SMS integration for sending hospital assignment notifications to ambulance drivers.

## Setup

### 1. Get Twilio Credentials

1. Sign up for a Twilio account at https://www.twilio.com/try-twilio
2. Get a Twilio phone number from the console
3. Find your Account SID and Auth Token at https://console.twilio.com/

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number in E.164 format
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Usage

### Dispatch Ambulance with SMS Notification

Send a POST request to `/api/dispatch/` with the following payload:

```json
{
  "ambulance_id": "AMB-001",
  "emergency_id": "EMG-001",
  "hospital_name": "AIIMS Hospital",
  "hospital_address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
  "driver_phone": "+919876543210",
  "patient_info": "Male, 45 years, chest pain",
  "eta": "12 minutes"
}
```

**Required Fields:**
- `ambulance_id`: Ambulance identifier
- `hospital_name`: Name of destination hospital
- `hospital_address`: Full address of the hospital
- `driver_phone`: Driver's phone number in E.164 format (e.g., +919876543210 for India)

**Optional Fields:**
- `emergency_id`: Emergency reference ID
- `patient_info`: Patient condition/information
- `eta`: Estimated time of arrival

**Response:**

```json
{
  "success": true,
  "message": "Ambulance dispatched successfully",
  "dispatch_id": "DSP-001",
  "ambulance_id": "AMB-001",
  "emergency_id": "EMG-001",
  "hospital_name": "AIIMS Hospital",
  "eta": "12 minutes",
  "sms_status": {
    "sent": true,
    "message_sid": "SM1234567890abcdef",
    "error": null
  }
}
```

### SMS Message Format

The driver will receive an SMS like this:

```
🚨 HOSPITAL ASSIGNMENT - AMB-001

🏥 DESTINATION: AIIMS Hospital
📍 ADDRESS: Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029
👤 PATIENT: Male, 45 years, chest pain
⏱️ ETA: 12 minutes

⚠️ Please acknowledge receipt and proceed to destination.
```

### Send Updates to Driver

Send a POST request to `/api/dispatch/{dispatch_id}/send-update`:

```json
{
  "update_type": "ROUTE_CHANGE",
  "details": "Heavy traffic on Ring Road. Take alternate route via NH-44."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Update sent to driver",
  "dispatch_id": "DSP-001",
  "sms_status": {
    "sent": true,
    "message_sid": "SM0987654321fedcba",
    "error": null
  }
}
```

### Get Dispatch Status

Send a GET request to `/api/dispatch/{dispatch_id}`:

```bash
GET /api/dispatch/DSP-001
```

**Response:**

```json
{
  "dispatch_id": "DSP-001",
  "status": "en_route",
  "ambulance_id": "AMB-001",
  "hospital_name": "AIIMS Hospital",
  "hospital_address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
  "eta": "5 minutes",
  "sms_sent": true,
  "current_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

### Get All Dispatches

Send a GET request to `/api/dispatch/`:

```bash
GET /api/dispatch/
```

## Phone Number Format

Phone numbers must be in E.164 format:
- Include the country code with a `+` prefix
- No spaces, dashes, or parentheses
- Examples:
  - India: `+919876543210`
  - US: `+14155551234`
  - UK: `+447700900123`

## Testing

### Using cURL

```bash
# Dispatch ambulance
curl -X POST http://localhost:8000/api/dispatch/ \
  -H "Content-Type: application/json" \
  -d '{
    "ambulance_id": "AMB-001",
    "hospital_name": "AIIMS Hospital",
    "hospital_address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
    "driver_phone": "+919876543210",
    "patient_info": "Male, 45 years, chest pain",
    "eta": "12 minutes"
  }'

# Send update
curl -X POST http://localhost:8000/api/dispatch/DSP-001/send-update \
  -H "Content-Type: application/json" \
  -d '{
    "update_type": "ROUTE_CHANGE",
    "details": "Take alternate route via NH-44"
  }'
```

### Using Python

```python
import requests

# Dispatch ambulance
response = requests.post(
    "http://localhost:8000/api/dispatch/",
    json={
        "ambulance_id": "AMB-001",
        "hospital_name": "AIIMS Hospital",
        "hospital_address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi",
        "driver_phone": "+919876543210",
        "patient_info": "Male, 45 years, chest pain",
        "eta": "12 minutes"
    }
)

print(response.json())
```

## Error Handling

If SMS sending fails, the API will still return a success response for the dispatch, but the `sms_status` will indicate the failure:

```json
{
  "success": true,
  "message": "Ambulance dispatched successfully",
  "dispatch_id": "DSP-001",
  "sms_status": {
    "sent": false,
    "message_sid": null,
    "error": "Unable to create record: The 'To' number +919876543210 is not a valid phone number."
  }
}
```

## Troubleshooting

### Common Issues

1. **SMS not sending**
   - Verify Twilio credentials in `.env` file
   - Check that Twilio account has sufficient credits
   - Ensure phone number is in E.164 format
   - Check if your Twilio number can send SMS to the destination country

2. **Invalid phone number error**
   - Phone numbers must include country code with `+` prefix
   - Use E.164 format: `+[country code][number]`
   - No spaces or special characters

3. **Twilio trial account limitations**
   - Trial accounts can only send SMS to verified phone numbers
   - Add phone numbers to "Verified Caller IDs" in Twilio console
   - Upgrade to paid account for unrestricted sending

## API Documentation

Full API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Security Notes

- Never commit your `.env` file to version control
- Keep your Twilio credentials secure
- Use environment variables for sensitive data
- Consider implementing rate limiting for SMS sending
- In production, use a proper database instead of in-memory storage

## Cost Considerations

- Twilio SMS pricing varies by destination country
- India SMS: ~$0.0057 per message
- US SMS: ~$0.0079 per message
- Check current pricing: https://www.twilio.com/sms/pricing

## Future Enhancements

- [ ] SMS delivery status tracking
- [ ] Driver acknowledgment system (reply to confirm)
- [ ] Two-way SMS communication
- [ ] SMS templates for different scenarios
- [ ] Multi-language support
- [ ] SMS analytics and reporting
- [ ] Integration with WhatsApp API for richer messaging
