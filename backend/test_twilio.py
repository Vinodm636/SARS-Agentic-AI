"""
Test script for Twilio SMS integration
Run this script to test the SMS service functionality
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def test_twilio_configuration():
    """Test if Twilio is properly configured"""
    print("🔍 Checking Twilio Configuration...")
    print("-" * 50)

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    phone_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not account_sid:
        print("❌ TWILIO_ACCOUNT_SID not found in .env file")
        return False
    else:
        print(f"✅ TWILIO_ACCOUNT_SID: {account_sid[:10]}...")

    if not auth_token:
        print("❌ TWILIO_AUTH_TOKEN not found in .env file")
        return False
    else:
        print(f"✅ TWILIO_AUTH_TOKEN: {auth_token[:10]}...")

    if not phone_number:
        print("❌ TWILIO_PHONE_NUMBER not found in .env file")
        return False
    else:
        print(f"✅ TWILIO_PHONE_NUMBER: {phone_number}")

    print("-" * 50)
    return True


def test_sms_service_initialization():
    """Test if SMS service can be initialized"""
    print("\n📱 Testing SMS Service Initialization...")
    print("-" * 50)

    try:
        from services.sms_service import sms_service
        print("✅ SMS Service initialized successfully")
        print(f"   From Number: {sms_service.from_number}")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize SMS service: {e}")
        return False


def test_send_sms(test_phone_number):
    """Test sending an SMS"""
    print("\n📤 Testing SMS Sending...")
    print("-" * 50)

    try:
        from services.sms_service import sms_service

        # Test hospital assignment SMS
        result = sms_service.send_hospital_assignment(
            driver_phone=test_phone_number,
            ambulance_id="AMB-TEST-001",
            hospital_name="Test Hospital",
            hospital_address="123 Test Street, Test City",
            patient_info="Test Patient - 30 years, stable condition",
            eta="10 minutes"
        )

        if result.get("success"):
            print("✅ SMS sent successfully!")
            print(f"   Message SID: {result.get('message_sid')}")
            print(f"   Status: {result.get('status')}")
            print(f"   To: {result.get('to')}")
        else:
            print(f"❌ Failed to send SMS: {result.get('error')}")
            return False

        return True
    except Exception as e:
        print(f"❌ Error sending SMS: {e}")
        return False


def main():
    """Main test function"""
    print("\n" + "=" * 50)
    print("   SARS Twilio SMS Integration Test")
    print("=" * 50)

    # Test 1: Configuration
    if not test_twilio_configuration():
        print("\n❌ Configuration test failed. Please check your .env file")
        return

    # Test 2: Service Initialization
    if not test_sms_service_initialization():
        print("\n❌ Service initialization failed. Please check your Twilio credentials")
        return

    # Test 3: Send SMS (optional)
    print("\n" + "=" * 50)
    print("Optional: Test SMS Sending")
    print("=" * 50)
    print("\n⚠️  WARNING: This will send a real SMS and may incur charges!")
    print("Make sure you have a verified phone number if using a trial account.\n")

    choice = input(
        "Do you want to send a test SMS? (yes/no): ").strip().lower()

    if choice == 'yes':
        test_phone = input(
            "Enter phone number to test (E.164 format, e.g., +919876543210): ").strip()

        if not test_phone.startswith('+'):
            print("❌ Phone number must start with '+' and include country code")
            return

        test_send_sms(test_phone)
    else:
        print("\n⏭️  Skipping SMS sending test")

    print("\n" + "=" * 50)
    print("   Test Complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
