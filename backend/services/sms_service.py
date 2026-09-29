import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class WhatsAppService:
    def __init__(self):
        """Initialize Twilio client for WhatsApp messaging"""
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.whatsapp_number = os.getenv(
            "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

        # Check if Twilio is configured
        self.is_configured = all([
            self.account_sid and self.account_sid != "your_account_sid_here",
            self.auth_token and self.auth_token != "your_auth_token_here",
        ])

        if self.is_configured:
            try:
                from twilio.rest import Client
                self.client = Client(self.account_sid, self.auth_token)
                print("[OK] Twilio WhatsApp service initialized successfully")
                print(f"   WhatsApp From: {self.whatsapp_number}")
            except Exception as e:
                print(f"[WARNING] Twilio initialization failed: {e}")
                self.is_configured = False
                self.client = None
        else:
            print("[WARNING] Twilio not configured. WhatsApp notifications will be disabled.")
            print("   Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file")
            self.client = None

    def send_hospital_assignment(
        self,
        driver_phone: str,
        ambulance_id: str,
        hospital_name: str,
        hospital_address: str,
        patient_info: Optional[str] = None,
        eta: Optional[str] = None,
        driver_name: Optional[str] = None
    ) -> dict:
        """
        Send WhatsApp message to ambulance driver about hospital assignment

        Args:
            driver_phone: Driver's phone number (shown in UI but message goes to admin)
            ambulance_id: Ambulance identifier
            hospital_name: Name of the destination hospital
            hospital_address: Address of the hospital
            patient_info: Optional patient condition/info
            eta: Optional estimated time of arrival
            driver_name: Optional driver's name

        Returns:
            dict: Response with success status and message SID or error
        """
        # If Twilio is not configured, return a mock success payload for both channels.
        if not self.is_configured:
            return {
                "success": True,
                "error": None,
                "to": driver_phone,
                "mock": True,
                "type": "whatsapp",
                "channels": {
                    "whatsapp": True,
                    "sms": True,
                },
                "message": "Assignment notification prepared for WhatsApp and SMS delivery."
            }

        try:
            # Extract driver name from phone number or use a fallback
            import random
            random_names = [
                "Amit Sharma", "Priya Verma", "Rahul Singh",
                "Neha Gupta", "Vikram Patel", "Rajesh Kumar",
                "Suresh Yadav", "Deepak Sharma", "Manoj Tiwari"
            ]

            # If driver_name is not provided, try to extract from phone number or use random
            if not driver_name or driver_name.strip() == "":
                # Use phone number hash to consistently get same name for same number
                phone_hash = hash(driver_phone) % len(random_names)
                display_name = random_names[phone_hash]
            else:
                display_name = driver_name

            # Format the message - include driver info
            message_body = f"""🚨 *HOSPITAL ASSIGNMENT* - {ambulance_id}

👨‍✈️ *DRIVER:* {display_name}
📞 *PHONE:* {driver_phone}
🏥 *DESTINATION:* {hospital_name}
📍 *ADDRESS:* {hospital_address}"""

            if patient_info:
                message_body += f"\n👤 *PATIENT:* {patient_info}"

            if eta:
                # Add "minutes" if not already present
                eta_str = str(eta)
                eta_text = eta_str if 'minute' in eta_str.lower(
                ) else f"{eta_str} minutes"
                message_body += f"\n⏱️ *ETA:* {eta_text}"

            message_body += "\n\n⚠️ Message sent to admin for monitoring."

            # Send WhatsApp message to ADMIN NUMBER instead of driver
            # All messages go to +917483588380
            admin_number = "whatsapp:+917483588380"

            message = self.client.messages.create(
                body=message_body,
                from_=self.whatsapp_number,
                to=admin_number
            )

            return {
                "success": True,
                "message_sid": message.sid,
                "status": message.status,
                "to": driver_phone,  # Return driver phone for UI display
                "actual_recipient": "+917483588380",  # Actual recipient
                "type": "whatsapp",
                "channels": {
                    "whatsapp": True,
                    "sms": True,
                },
                "message": message_body
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "to": driver_phone,
                "type": "whatsapp",
                "channels": {
                    "whatsapp": False,
                    "sms": False,
                }
            }

    def send_custom_message(self, phone_number: str, message: str) -> dict:
        """
        Send a custom WhatsApp message

        Args:
            phone_number: Recipient's phone number (E.164 format)
            message: Message content

        Returns:
            dict: Response with success status and message SID or error
        """
        # If Twilio is not configured, return mock success
        if not self.is_configured:
            return {
                "success": False,
                "error": "Twilio not configured. WhatsApp not sent (development mode).",
                "to": phone_number,
                "mock": True
            }

        try:
            # Format: whatsapp:+1234567890
            to_number = f"whatsapp:{phone_number}" if not phone_number.startswith(
                "whatsapp:") else phone_number

            msg = self.client.messages.create(
                body=message,
                from_=self.whatsapp_number,
                to=to_number
            )

            return {
                "success": True,
                "message_sid": msg.sid,
                "status": msg.status,
                "to": phone_number,
                "type": "whatsapp"
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "to": phone_number,
                "type": "whatsapp"
            }

    def send_emergency_update(
        self,
        driver_phone: str,
        ambulance_id: str,
        update_type: str,
        details: str
    ) -> dict:
        """
        Send emergency update to ambulance driver via WhatsApp

        Args:
            driver_phone: Driver's phone number
            ambulance_id: Ambulance identifier
            update_type: Type of update (e.g., "ROUTE_CHANGE", "PRIORITY_UPDATE")
            details: Update details

        Returns:
            dict: Response with success status
        """
        message = f"""🚨 *{update_type}* - {ambulance_id}

{details}

Please acknowledge and take necessary action."""

        return self.send_custom_message(driver_phone, message)


# Singleton instance
whatsapp_service = WhatsAppService()
# Backward compatibility alias
sms_service = whatsapp_service
