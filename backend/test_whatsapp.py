"""
Test script for Twilio WhatsApp integration
"""

from services.sms_service import sms_service


def main():
    print("\n" + "=" * 50)
    print("   SARS WhatsApp Integration Test")
    print("=" * 50)

    print("\n📱 WhatsApp Service Status:")
    print("-" * 50)
    if sms_service.is_configured:
        print("✅ Twilio configured")
        print(f"   WhatsApp Number: {sms_service.whatsapp_number}")
    else:
        print("❌ Twilio not configured")
        return

    print("\n⚠️  IMPORTANT: Before testing, you must:")
    print("1. Open WhatsApp on your phone")
    print("2. Send a message to: +1 415 523 8886")
    print("3. Message text: 'join [your-sandbox-code]'")
    print("   (You can find your code at: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)")
    print()

    choice = input(
        "Have you joined the WhatsApp sandbox? (yes/no): ").strip().lower()

    if choice != 'yes':
        print("\n⏭️  Please join the sandbox first, then run this test again.")
        return

    phone = input(
        "\nEnter your WhatsApp number (E.164 format, e.g., +919876543210): ").strip()

    if not phone.startswith('+'):
        print("❌ Phone number must start with '+' and include country code")
        return

    print("\n📤 Sending WhatsApp Message...")
    print("-" * 50)

    result = sms_service.send_whatsapp_hospital_assignment(
        driver_phone=phone,
        ambulance_id="AMB-TEST-001",
        hospital_name="AIIMS Hospital",
        hospital_address="Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
        patient_info="Male, 45 years, chest pain, conscious",
        eta="12 minutes"
    )

    if result.get("success"):
        print("✅ WhatsApp message sent successfully!")
        print(f"   Message SID: {result.get('message_sid')}")
        print(f"   Status: {result.get('status')}")
        print(f"   To: {result.get('to')}")
        print("\n📱 Check your WhatsApp - you should receive the message!")
    else:
        print(f"❌ Failed to send WhatsApp: {result.get('error')}")

    print("\n" + "=" * 50)
    print("   Test Complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
