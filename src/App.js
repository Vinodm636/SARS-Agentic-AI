import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import RoutePlanning from './pages/RoutePlanning';
import Analytics from './pages/Analytics';
import ActiveEmergencies from './pages/ActiveEmergencies';
import Ambulances from './pages/Ambulances';
import Track from './pages/Track';
import LiveTracking from './pages/LiveTracking';
import Settings from './pages/Settings';
import Help from './pages/Help';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/active-emergencies" element={<ActiveEmergencies />} />
          <Route path="/ambulances" element={<Ambulances />} />
          <Route path="/routes" element={<RoutePlanning />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/track" element={<Track />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
