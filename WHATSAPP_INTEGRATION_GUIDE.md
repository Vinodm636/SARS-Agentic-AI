# WhatsApp Dispatch Integration - Complete Guide

## 🎯 Overview
When an admin clicks the **"Confirm & Dispatch"** button (after selecting "Pick Ambulance"), the system now automatically:
1. Fetches ambulance details including driver phone number
2. Calls the dispatch API endpoint
3. Sends WhatsApp message to the driver with hospital assignment
4. Shows success/error feedback to the admin

## 🔧 What Was Changed

### Frontend Changes (`src/pages/ActiveEmergencies.js`)

#### 1. Import Statement (Line 52)
```javascript
// Before:
import { transcriptionAPI } from "../services/api";

// After:
import { transcriptionAPI, dispatchAPI, ambulanceAPI } from "../services/api";
```

#### 2. Updated `handleConfirmAmbulance` Function (Line 802)
The function is now **async** and includes:
- Fetches ambulance details to get driver phone
- Calls `dispatchAPI.createDispatch()` with all required data
- Sends WhatsApp notification automatically
- Shows success message with WhatsApp delivery status
- Error handling with user-friendly messages

### Backend (Already Complete)
- ✅ WhatsApp service in `backend/services/sms_service.py`
- ✅ Dispatch endpoint in `backend/routers/dispatch.py`
- ✅ Ambulance data with verified numbers in `backend/routers/ambulances.py`

## 📱 How It Works

### User Flow:
1. Admin opens "New Emergency" modal
2. Fills in emergency details (patient info, location, etc.)
3. Clicks **"Pick Ambulance"** button
4. System shows available ambulances with ETA calculation
5. System auto-selects best ambulance (shortest ETA)
6. Admin clicks **"Confirm & Dispatch {AMB-ID}"** button
7. 🚀 **WhatsApp message is sent to driver automatically!**

### WhatsApp Message Format:
```
🚨 EMERGENCY DISPATCH

Ambulance: AMB-001
Hospital: AIIMS New Delhi
Address: Ansari Nagar, New Delhi, Delhi 110029

Patient: John Doe - Heart Attack
ETA: 5 min

📍 Proceed to hospital immediately
```

### API Request Example:
```javascript
{
  "ambulance_id": "AMB-001",
  "hospital_name": "AIIMS New Delhi",
  "hospital_address": "Ansari Nagar, New Delhi, Delhi 110029",
  "driver_phone": "+918630446901",
  "patient_info": "John Doe - Heart Attack",
  "eta": 5
}
```

### API Response Example:
```javascript
{
  "success": true,
  "message": "Ambulance dispatched successfully",
  "dispatch_id": "DSP-001",
  "ambulance_id": "AMB-001",
  "hospital_name": "AIIMS New Delhi",
  "eta": 5,
  "whatsapp_status": {
    "sent": true,
    "message_sid": "SM5862e4a48f38e27328ab47dec5a51cff",
    "error": null
  }
}
```

## 🧪 Testing Steps

### 1. Start the Backend
```bash
cd backend
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
uvicorn main:app --reload
```

### 2. Start the Frontend
```bash
# In a new terminal
npm start
```

### 3. Test the Flow
1. Navigate to **Active Emergencies** page
2. Click **"+ New Emergency"** button
3. Fill in the form:
   - **Patient Name**: Test Patient
   - **Description**: Heart Attack
   - **Location**: Connaught Place
   - **Priority**: Critical
4. Click **"Pick Ambulance"**
5. Wait for route calculation (ambulances will appear sorted by ETA)
6. Review the auto-selected ambulance (shortest ETA)
7. Click **"Confirm & Dispatch AMB-001"**
8. Check the alert message - it will show:
   - Emergency created successfully
   - ✅ WhatsApp notification sent to driver
   - Driver name and phone number

### 4. Verify WhatsApp Delivery
Check your phone at **+918630446901** for the WhatsApp message!

## 🔍 Troubleshooting

### Backend Not Running
**Error**: `Failed to dispatch ambulance: Network Error`

**Solution**: Make sure backend is running on `http://localhost:8000`
```bash
cd backend
uvicorn main:app --reload
```

### WhatsApp Not Delivered
**Alert shows**: `⚠️ WhatsApp notification failed: ...`

**Check**:
1. Verify `.env` file has correct Twilio credentials
2. Verify phone number is in E.164 format (+918630446901)
3. Check Twilio console for error messages
4. Ensure WhatsApp Sandbox is active

### Ambulance Not Found
**Alert shows**: `Ambulance AMB-001 not found in system`

**Solution**: Verify backend has mock ambulances:
```bash
curl http://localhost:8000/api/ambulances
```

Should return ambulances with IDs: AMB-001, AMB-002

## 📝 Default Configuration

### Hospital (Hardcoded)
Currently using **AIIMS New Delhi** as default hospital. To make it dynamic:

1. Add hospital selection field to the emergency form
2. Update the `dispatchData` object in `handleConfirmAmbulance`

Example:
```javascript
const dispatchData = {
  ambulance_id: selectedAmbulance.ambulanceId,
  hospital_name: newEmergencyForm.hospitalName || "AIIMS New Delhi",
  hospital_address: newEmergencyForm.hospitalAddress || "Ansari Nagar, New Delhi",
  driver_phone: ambulance.driver.phone,
  patient_info: `${newEmergencyForm.patientName || "Unknown Patient"} - ${newEmergencyForm.description}`,
  eta: selectedAmbulance.eta,
};
```

### Verified Phone Numbers
- **Driver 1** (AMB-001): +918630446901
- **Driver 2** (AMB-002): +919876123457

## 🎉 Success Indicators

When everything works correctly, you'll see:
1. ✅ Alert message with "WhatsApp notification sent to driver"
2. ✅ Driver name and phone shown in alert
3. ✅ WhatsApp message received on driver's phone
4. ✅ Emergency created with "dispatched" status
5. ✅ Dispatch ID assigned (DSP-001, DSP-002, etc.)

## 🚀 Next Steps

### Optional Enhancements:
1. **Dynamic Hospital Selection**: Add hospital dropdown in emergency form
2. **Real-time Status Updates**: Show WhatsApp delivery status in UI (not just alert)
3. **Dispatch History**: Show all dispatches with WhatsApp status
4. **Retry Failed Messages**: Button to resend WhatsApp if delivery fails
5. **Driver Confirmation**: Allow drivers to confirm receipt via WhatsApp reply

## 📞 Support

If you encounter any issues:
1. Check backend logs: `uvicorn main:app --reload`
2. Check browser console for frontend errors
3. Verify Twilio credentials in `.env`
4. Test dispatch API directly:
```bash
curl -X POST http://localhost:8000/api/dispatch/ \
  -H "Content-Type: application/json" \
  -d '{
    "ambulance_id": "AMB-001",
    "hospital_name": "AIIMS New Delhi",
    "hospital_address": "Ansari Nagar, New Delhi",
    "driver_phone": "+918630446901",
    "patient_info": "Test Patient - Heart Attack",
    "eta": 5
  }'
```

---

**Integration Complete! 🎊**

The WhatsApp dispatch feature is now fully integrated with the "PICK AMBULANCE" button workflow.
