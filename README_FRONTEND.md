# Smart Ambulance Routing System (SARS) - Frontend

React-based frontend for the AI-powered ambulance dispatch system.

## Features

- 🎙️ **Audio Upload**: Drag-and-drop MP3 call recordings
- 🤖 **AI Transcription**: Automatic transcription and data extraction
- 📋 **Smart Forms**: Auto-filled dispatch forms with patient details
- 🗺️ **Live Map**: Real-time ambulance tracking with Google Maps
- ⏱️ **ETA Calculation**: Traffic-aware routing and arrival time estimates
- 🚑 **Ambulance Selection**: Visual selection of optimal ambulance

## Tech Stack

- React.js 19.2
- Material-UI (MUI) 5
- Google Maps API
- Axios for API calls
- React Router

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env` file and add your API keys:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Running the App

```bash
npm start
```

The app will run on `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── AudioUpload.js       # MP3 upload with drag-and-drop
│   ├── DispatchForm.js      # Auto-filled patient form
│   ├── MapView.js           # Google Maps with ambulances
│   └── AmbulanceCard.js     # Ambulance info card
├── pages/
│   └── Dashboard.js         # Main admin dashboard
├── services/
│   └── api.js              # Backend API integration
└── App.js                  # Main app with routing
```

## Usage Flow

1. **Upload Call Recording**: Admin uploads MP3 file of emergency call
2. **AI Processing**: Backend transcribes and extracts patient info
3. **Review Form**: Auto-filled form appears with extracted data
4. **View Map**: All available ambulances shown on map with routes
5. **Select Ambulance**: Click on fastest ambulance based on ETA
6. **Dispatch**: Submit form to dispatch ambulance with optimized route

## Components

### AudioUpload
- Drag-and-drop file upload
- Supports MP3, WAV, M4A
- Progress indicator
- Error handling

### DispatchForm
- Auto-filled from AI extraction
- Patient information
- Emergency details
- Location data
- Caller information
- Manual editing allowed

### MapView
- Google Maps integration
- Real-time ambulance markers
- Patient location marker
- Route visualization
- ETA calculations
- Traffic data integration

### Dashboard
- Step-by-step workflow
- Integrated all components
- Success notifications
- Reset functionality

## API Integration

All backend calls are handled through `services/api.js`:
- Transcription API
- Ambulance API
- Dispatch API
- Maps & Routing API
- Tracking API

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

Proprietary - For internal use only
