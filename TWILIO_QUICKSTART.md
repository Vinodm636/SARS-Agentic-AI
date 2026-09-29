# Quick Start: Twilio SMS Setup

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Twilio Account (FREE)
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free trial account
3. You'll get $15.50 in free credit!

### Step 2: Get Your Credentials
1. Login to Twilio Console: https://console.twilio.com/
2. You'll see your **Account SID** and **Auth Token** on the dashboard
3. Copy both values

### Step 3: Get a Phone Number
1. In Twilio Console, go to: **Phone Numbers** → **Manage** → **Buy a number**
2. Or use this direct link: https://console.twilio.com/us1/develop/phone-numbers/manage/search
3. Select your country
4. Click "Buy" on any available number (FREE with trial!)
5. Copy your new phone number (format: +1234567890)

### Step 4: Configure SARS Backend
Open `backend/.env` and update these lines:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

Replace with your actual values from Steps 2 and 3.

### Step 5: Verify (Trial Account Only)
**Important for Trial Accounts:** You can only send SMS to verified numbers.

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new number"
3. Enter the driver's phone number (the one you'll test with)
4. Verify via SMS code

### Step 6: Test It!
```bash
cd backend
python test_twilio.py
```

## ✅ You're Ready!

Now when you dispatch an ambulance in SARS, the driver will receive an SMS like:

```
🚨 HOSPITAL ASSIGNMENT - AMB-001

🏥 DESTINATION: AIIMS Hospital
📍 ADDRESS: Sri Aurobindo Marg, New Delhi
👤 PATIENT: Male, 45 years, chest pain
⏱️ ETA: 12 minutes

⚠️ Please acknowledge receipt and proceed to destination.
```

## 🔧 Troubleshooting

### "SMS not sent (development mode)"
- Your Twilio credentials are not configured in `.env` file
- Check that values are not the default placeholders

### "Unable to create record: The 'To' number is not valid"
- Phone number must be in E.164 format: `+[country code][number]`
- No spaces or special characters
- Examples: `+919876543210` (India), `+14155551234` (US)

### "Permission to send an SMS has not been enabled"
- **Trial account limitation**: Can only send to verified numbers
- Add phone number to verified list (Step 5 above)
- OR upgrade to paid account (no restrictions)

## 💰 Pricing (After Trial)

- India SMS: ~$0.0057 per message
- US SMS: ~$0.0079 per message
- Phone number: ~$1/month

With $15.50 free credit, you can send approximately:
- ~2,700 SMS in India
- ~1,962 SMS in US

## 🎓 More Resources

- Twilio Console: https://console.twilio.com/
- Documentation: https://www.twilio.com/docs/sms
- Pricing: https://www.twilio.com/sms/pricing
- Support: https://support.twilio.com/

## 🔒 Security Tips

1. Never commit `.env` file to git
2. Keep your Auth Token secret
3. Use environment variables in production
4. Consider IP whitelisting in production
5. Monitor usage in Twilio Console

## 📞 Support

Need help? Check:
1. Full documentation: `backend/README_TWILIO.md`
2. Implementation summary: `TWILIO_IMPLEMENTATION.md`
3. Twilio support: https://support.twilio.com/

---

**That's it! You're ready to send SMS notifications to ambulance drivers! 🚑📱**
