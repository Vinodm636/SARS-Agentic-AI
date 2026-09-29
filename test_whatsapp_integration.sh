#!/bin/bash

# Test WhatsApp Dispatch Integration
# This script tests the complete flow from frontend to WhatsApp delivery

echo "🧪 Testing WhatsApp Dispatch Integration"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if backend is running
echo "📡 Step 1: Checking if backend is running..."
if curl -s http://localhost:8000/api/ambulances > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "Please start the backend:"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  uvicorn main:app --reload"
    exit 1
fi

echo ""

# Step 2: Get ambulances
echo "🚑 Step 2: Fetching ambulances..."
AMBULANCES=$(curl -s http://localhost:8000/api/ambulances)
echo "Available ambulances:"
echo "$AMBULANCES" | jq -r '.[] | "\(.ambulance_id) - Driver: \(.driver.name) (\(.driver.phone))"'

echo ""

# Step 3: Test dispatch API
echo "📤 Step 3: Testing dispatch API..."
echo "Sending dispatch request for AMB-001..."

DISPATCH_RESPONSE=$(curl -s -X POST http://localhost:8000/api/dispatch/ \
  -H "Content-Type: application/json" \
  -d '{
    "ambulance_id": "AMB-001",
    "hospital_name": "AIIMS New Delhi",
    "hospital_address": "Ansari Nagar, New Delhi, Delhi 110029",
    "driver_phone": "+918630446901",
    "patient_info": "Test Integration - Emergency Dispatch",
    "eta": 5
  }')

echo ""
echo "Response:"
echo "$DISPATCH_RESPONSE" | jq '.'

# Check if WhatsApp was sent
WHATSAPP_SENT=$(echo "$DISPATCH_RESPONSE" | jq -r '.whatsapp_status.sent')
MESSAGE_SID=$(echo "$DISPATCH_RESPONSE" | jq -r '.whatsapp_status.message_sid')

echo ""
if [ "$WHATSAPP_SENT" = "true" ]; then
    echo -e "${GREEN}✅ WhatsApp message sent successfully!${NC}"
    echo "Message SID: $MESSAGE_SID"
    echo ""
    echo "📱 Check your phone at +918630446901 for the WhatsApp message!"
else
    ERROR=$(echo "$DISPATCH_RESPONSE" | jq -r '.whatsapp_status.error')
    echo -e "${RED}❌ WhatsApp message failed${NC}"
    echo "Error: $ERROR"
fi

echo ""
echo "========================================"
echo "🎉 Test Complete!"
echo ""
echo "To test from the UI:"
echo "1. Navigate to Active Emergencies page"
echo "2. Click '+ New Emergency'"
echo "3. Fill in the form"
echo "4. Click 'Pick Ambulance'"
echo "5. Click 'Confirm & Dispatch AMB-001'"
echo "6. Check the alert message for WhatsApp status"
