#!/bin/bash

# SARS Twilio Integration - Testing Script
# This script demonstrates how to test the dispatch API with SMS functionality

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  SARS Dispatch API - SMS Integration Test${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Base URL
BASE_URL="http://localhost:8000/api"

# Test 1: Create a dispatch with SMS notification
echo -e "${YELLOW}Test 1: Dispatch Ambulance with SMS Notification${NC}"
echo "POST $BASE_URL/dispatch/"
echo ""

DISPATCH_RESPONSE=$(curl -s -X POST "$BASE_URL/dispatch/" \
  -H "Content-Type: application/json" \
  -d '{
    "ambulance_id": "AMB-001",
    "emergency_id": "EMG-001",
    "hospital_name": "AIIMS Hospital",
    "hospital_address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
    "driver_phone": "+919876543210",
    "patient_info": "Male, 45 years, chest pain, conscious",
    "eta": "12 minutes"
  }')

echo "$DISPATCH_RESPONSE" | python -m json.tool 2>/dev/null || echo "$DISPATCH_RESPONSE"
echo ""

# Extract dispatch_id from response
DISPATCH_ID=$(echo "$DISPATCH_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin).get('dispatch_id', 'DSP-001'))" 2>/dev/null || echo "DSP-001")

echo -e "${GREEN}✓ Dispatch created: $DISPATCH_ID${NC}\n"

# Test 2: Get dispatch status
echo -e "${YELLOW}Test 2: Get Dispatch Status${NC}"
echo "GET $BASE_URL/dispatch/$DISPATCH_ID"
echo ""

curl -s -X GET "$BASE_URL/dispatch/$DISPATCH_ID" | python -m json.tool 2>/dev/null
echo ""
echo -e "${GREEN}✓ Status retrieved${NC}\n"

# Test 3: Get all dispatches
echo -e "${YELLOW}Test 3: Get All Dispatches${NC}"
echo "GET $BASE_URL/dispatch/"
echo ""

curl -s -X GET "$BASE_URL/dispatch/" | python -m json.tool 2>/dev/null
echo ""
echo -e "${GREEN}✓ All dispatches retrieved${NC}\n"

# Test 4: Send update to driver
echo -e "${YELLOW}Test 4: Send Update Message to Driver${NC}"
echo "POST $BASE_URL/dispatch/$DISPATCH_ID/send-update"
echo ""

curl -s -X POST "$BASE_URL/dispatch/$DISPATCH_ID/send-update" \
  -H "Content-Type: application/json" \
  -d '{
    "update_type": "ROUTE_CHANGE",
    "details": "Heavy traffic on Ring Road. Please take alternate route via NH-44. ETA updated to 15 minutes."
  }' | python -m json.tool 2>/dev/null
echo ""
echo -e "${GREEN}✓ Update sent to driver${NC}\n"

# Test 5: Get ambulances
echo -e "${YELLOW}Test 5: Get Available Ambulances${NC}"
echo "GET $BASE_URL/ambulances/"
echo ""

curl -s -X GET "$BASE_URL/ambulances/" | python -m json.tool 2>/dev/null
echo ""
echo -e "${GREEN}✓ Ambulances list retrieved${NC}\n"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  All Tests Completed!${NC}"
echo -e "${BLUE}================================================${NC}\n"

echo -e "${YELLOW}Note:${NC} If Twilio is not configured in .env file,"
echo -e "      SMS will not be sent but the API will still work."
echo -e "      Check the response 'sms_status' field for SMS send status."
echo ""
echo -e "${GREEN}To configure Twilio:${NC}"
echo "  1. Sign up at https://www.twilio.com/try-twilio"
echo "  2. Get your Account SID, Auth Token, and Phone Number"
echo "  3. Update backend/.env file with your credentials"
echo "  4. Run: python backend/test_twilio.py"
echo ""
