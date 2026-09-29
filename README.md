# SARS - Smart Ambulance Routing System 🚑

AI-powered emergency ambulance dispatch system with real-time WhatsApp notifications, intelligent route optimization, and automated emergency transcription.

## 🚀 Features

### ✅ Emergency Management
- **AI Call Transcription** - Upload emergency call recordings (MP3/WAV), AI automatically extracts patient details
- **Smart Emergency Creation** - Auto-filled forms with patient name, location, condition, and priority
- **Active Emergency Dashboard** - Real-time monitoring of all ongoing emergencies
- **Emergency Status Tracking** - Track emergencies from creation to resolution

### 🚨 Intelligent Dispatch System
- **AI-Powered Route Optimization** - Automatically calculates fastest routes for all available ambulances
- **Real-time ETA Calculation** - Live distance and time estimates for each ambulance
- **Interactive Route Visualization** - TomTom maps with color-coded routes and ambulance markers
- **Auto-Selection Algorithm** - AI recommends best ambulance based on ETA, crew size, and equipment
- **5-Second Countdown Dispatch** - Smart auto-dispatch with manual override option

### 📱 WhatsApp Integration (Twilio)
- **Instant Driver Notifications** - Automatic WhatsApp messages sent to ambulance drivers on dispatch
- **Hospital Assignment Details** - Messages include hospital name, address, patient info, and ETA
- **Delivery Status Tracking** - Real-time confirmation of message delivery
- **WhatsApp Sandbox Support** - Demo mode with verified phone numbers
- **Multi-Driver Support** - Different drivers receive notifications for their assigned ambulances

### 🗺️ Advanced Mapping
- **TomTom Maps Integration** - Professional mapping with traffic data
- **Live Ambulance Tracking** - Real-time location updates for all ambulances
- **Multi-Route Visualization** - See all possible routes simultaneously
- **Patient Location Markers** - Pulsing emergency markers with animations
- **Distance & ETA Display** - Precise calculations for each ambulance

### 🚑 Ambulance Management
- **Fleet Overview** - View all ambulances with status, location, and equipment
- **Driver Information** - Complete driver details with contact numbers
- **Vehicle Details** - Registration numbers, type (ALS/BLS), and equipment list
- **Status Updates** - Track availability (available, en route, at scene)

### 🎨 Modern UI/UX
- **Material-UI Design** - Professional, responsive Material Design components
- **Dark Sidebar Navigation** - Multi-role navigation (Admin/Dispatcher/Driver)
- **Mobile-Responsive** - Full functionality on desktop, tablet, and mobile
- **Real-time Status Updates** - Live emergency counts and system health
- **Color-Coded Priorities** - Visual priority indicators (Critical: Red, High: Orange, Medium: Yellow)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with Hooks
- **Material-UI (MUI) 5** - Professional UI components
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **TomTom Maps API** - Interactive mapping and routing

### Backend
- **FastAPI** - High-performance Python web framework
- **Twilio API** - WhatsApp messaging integration
- **Groq API** - AI-powered transcription and data extraction
- **Python 3.11+** - Modern Python with async support

### DevOps
- **Uvicorn** - ASGI server for FastAPI
- **CORS Middleware** - Cross-origin request handling
- **Environment Variables** - Secure credential management

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- Twilio Account (for WhatsApp)
- Groq API Key (for AI transcription)
- TomTom Maps API Key

### 📚 Additional Documentation
- **[WhatsApp Integration Guide](./WHATSAPP_INTEGRATION_GUIDE.md)** - Detailed setup and troubleshooting for WhatsApp notifications
- **[Twilio Quickstart](./TWILIO_QUICKSTART.md)** - Quick reference for Twilio setup
- **[SMS Feature Documentation](./SMS_FEATURE_README.md)** - Complete SMS/WhatsApp feature details
- **[Frontend Documentation](./README_FRONTEND.md)** - Frontend-specific implementation details

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The frontend runs on `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your credentials to .env:
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
# GROQ_API_KEY=your_groq_api_key

# Start backend server
uvicorn main:app --reload
```

The backend runs on `http://localhost:8000`

## 🔑 API Keys Setup

### Twilio WhatsApp (Required for notifications)
1. Sign up at [https://www.twilio.com/](https://www.twilio.com/)
2. Get your Account SID and Auth Token from Console
3. Join WhatsApp Sandbox: [https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
4. Send "join [your-sandbox-code]" to `+14155238886` from your phone
5. Add verified phone numbers in E.164 format (+918630446901)

### Groq API (Required for transcription)
1. Sign up at [https://console.groq.com/](https://console.groq.com/)
2. Generate API key from Keys section
3. Add to `.env` file

### TomTom Maps (Required for mapping)
1. Sign up at [https://developer.tomtom.com/](https://developer.tomtom.com/)
2. Create API key
3. Replace key in `src/pages/Track.js`

## 📂 Project Structure

```
SARS_AMB/
├── backend/
│   ├── main.py                      # FastAPI application entry
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Environment variables (create this)
│   ├── routers/
│   │   ├── ambulances.py           # Ambulance CRUD endpoints
│   │   ├── dispatch.py             # Dispatch & WhatsApp endpoints
│   │   ├── emergencies.py          # Emergency management
│   │   └── transcription.py        # AI transcription service
│   ├── services/
│   │   ├── sms_service.py          # WhatsApp/Twilio integration
│   │   └── transcription_service.py # Groq AI transcription
│   └── models/
│       └── __init__.py             # Data models
├── src/
│   ├── components/
│   │   ├── AmbulanceCard.js        # Ambulance info cards
│   │   ├── AudioUpload.js          # Audio file upload
│   │   ├── DispatchForm.js         # Emergency dispatch form
│   │   ├── MapView.js              # Map visualization
│   │   ├── Sidebar.js              # Navigation sidebar
│   │   ├── StatusPanel.js          # System status
│   │   └── TopNavBar.js            # Top navigation
│   ├── pages/
│   │   ├── ActiveEmergencies.js    # Emergency dashboard
│   │   ├── Ambulances.js           # Ambulance fleet view
│   │   ├── Dashboard.js            # Main dashboard
│   │   ├── Track.js                # Route tracking page
│   │   ├── Analytics.js            # Analytics dashboard
│   │   └── Settings.js             # App settings
│   ├── services/
│   │   └── api.js                  # API client (Axios)
│   └── App.js                      # Main React app
├── public/
│   └── index.html                  # HTML template
└── package.json                    # Node dependencies
```

## 🎯 Complete Workflow

### 1. Emergency Call Reception
- Dispatcher receives emergency call
- Call is recorded as MP3/WAV file

### 2. AI Transcription
- Upload audio file to Active Emergencies page
- Click "Upload & Transcribe"
- AI extracts: Patient name, age, location, condition, severity

### 3. Emergency Creation
- Review auto-filled form
- Edit any details if needed
- Add special requirements (Cardiac Care, Trauma Team, etc.)
- Click "Pick Ambulance"

### 4. Intelligent Route Analysis
- System calculates routes from ALL available ambulances
- AI analyzes: Distance, ETA, crew size, equipment
- Routes displayed on map with color coding
- Best ambulance auto-selected (shortest ETA)

### 5. Auto-Dispatch with WhatsApp
- 5-second countdown begins
- User can manually select different ambulance
- **After countdown: WhatsApp message sent automatically**
- Driver receives hospital assignment with all details

### 6. WhatsApp Notification Format
```
🚨 EMERGENCY DISPATCH

Ambulance: AMB-105
Hospital: AIIMS New Delhi
Address: Ansari Nagar, New Delhi, Delhi 110029

Patient: John Doe - Heart Attack
ETA: 5 min

📍 Proceed to hospital immediately
```

### 7. Emergency Tracking
- Emergency marked as "Dispatched"
- Real-time status updates
- Driver confirmation tracking

## � WhatsApp Setup Guide

### For Testing/Demo:
1. **Join Twilio Sandbox**
   - Send WhatsApp message to `+1 415 523 8886`
   - Message text: `join [your-code]` (e.g., "join happy-donkey")

2. **Add Verified Numbers**
   - In Twilio Console → Phone Numbers → Verified Caller IDs
   - Add driver phone numbers in E.164 format
   - Current verified: +918630446901, +919876512345

3. **Configure Backend**
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

4. **Test Dispatch**
   - Create emergency
   - Click "Pick Ambulance"
   - Wait for countdown
   - Check phone for WhatsApp message!

## 🚑 Ambulance Fleet (Demo Data)

| ID | Vehicle Number | Type | Driver | Phone |
|---|---|---|---|---|
| AMB-105 | KA-05-MN-9876 | Advanced Life Support | Amit Sharma | +918630446901 |
| AMB-208 | MH-12-XY-4321 | Basic Life Support | Priya Verma | +918618243016 |
| AMB-312 | DL-08-PQ-7890 | Advanced Life Support | Rahul Singh | +918630446901 |
| AMB-456 | UP-16-RS-2468 | Basic Life Support | Neha Gupta | +918618243016 |
| AMB-589 | HR-26-TU-1357 | Advanced Life Support | Vikram Patel | +918630446901 |

## 🔧 API Endpoints

### Ambulances
- `GET /api/ambulances` - Get all ambulances
- `GET /api/ambulances/{id}` - Get ambulance by ID
- `PUT /api/ambulances/{id}/status` - Update ambulance status

### Dispatch
- `POST /api/dispatch/` - Create dispatch & send WhatsApp
- `GET /api/dispatch/` - Get all dispatches
- `GET /api/dispatch/{id}` - Get dispatch by ID

### Transcription
- `POST /api/transcription/upload` - Upload audio & transcribe
- Returns: Transcription + Extracted patient data

## 🎨 UI Screenshots

### Active Emergencies Dashboard
- Emergency table with search/filter
- Status indicators (Critical, High, Medium, Low)
- Quick actions (View, Dispatch)

### Route Tracking Page
- Interactive map with ambulance routes
- Color-coded routes by ambulance
- ETA cards sorted by fastest first
- AI recommendation badge on best choice

### Dispatch Confirmation
- WhatsApp delivery status
- Driver name and phone
- Dispatch ID and timestamp

## � Troubleshooting

### WhatsApp Not Sending
**Problem**: Error "WhatsApp failed"

**Solutions**:
1. Check Twilio credentials in `.env`
2. Verify phone numbers are in E.164 format
3. Ensure WhatsApp Sandbox is active
4. Restart backend after `.env` changes
5. Check Twilio Console for error logs

### Backend Not Running
**Problem**: Cannot connect to API

**Solutions**:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend Build Errors
**Problem**: npm start fails

**Solutions**:
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## 🔒 Security Notes

- **Never commit `.env` file** to git
- **API keys** should be environment variables
- **Phone numbers** must be verified in Twilio
- **CORS** is configured for localhost only (update for production)

## 📈 Future Enhancements

- [ ] Real-time GPS tracking integration
- [ ] Driver mobile app with route navigation
- [ ] Hospital bed availability integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Voice-to-dispatch (live transcription)
- [ ] SMS fallback for failed WhatsApp
- [ ] Two-way WhatsApp communication
- [ ] Driver acknowledgment system
- [ ] Performance metrics and KPIs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is for educational and demonstration purposes.

## 🙏 Acknowledgments

- **Twilio** - WhatsApp Business API
- **Groq** - AI Transcription
- **TomTom** - Mapping and Routing
- **Material-UI** - React Components
- **FastAPI** - Python Web Framework

---

**Built with ❤️ for saving lives**

**Emergency? Every second counts. SARS gets help there faster. 🚑💨**
