import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
} from '@mui/material';
import {
  Add,
  Notifications,
  Traffic,
  LocalHospital,
  Warning,
  ZoomIn,
  ZoomOut,
  Navigation,
  Fullscreen,
  Cloud,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard Page
 * Live map showing ambulances and emergencies with status panel
 */
const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [mapLayers, setMapLayers] = useState(() => ['traffic', 'hospitals', 'incidents']);
  const [ambulanceMarkers, setAmbulanceMarkers] = useState([]);
  const [dashboardMap, setDashboardMap] = useState(null);
  const [stats, setStats] = useState({
    activeAmbulances: 0,
    activeEmergencies: 0,
    avgResponseTime: 'N/A',
    hospitals: 0,
    confidenceLevel: 'High (92%)',
    trafficInfo: 'Loading traffic information...',
    weather: 'Light Rain',
    weatherDesc: 'Wet roads, visibility moderate',
  });
  const [trafficData, setTrafficData] = useState(null);
  
  const navigate = useNavigate();

  // Mock data for ambulances
  const mockAmbulances = [
    { id: 'AMB-001', status: 'available', location: { lat: 28.6139, lng: 77.2090 }, crew: 3 },
    { id: 'AMB-002', status: 'enroute', location: { lat: 28.6189, lng: 77.2150 }, crew: 3 },
    { id: 'AMB-003', status: 'available', location: { lat: 28.6089, lng: 77.2000 }, crew: 2 },
    { id: 'AMB-004', status: 'onscene', location: { lat: 28.6239, lng: 77.2200 }, crew: 4 },
    { id: 'AMB-005', status: 'available', location: { lat: 28.6039, lng: 77.1950 }, crew: 3 },
    { id: 'AMB-006', status: 'enroute', location: { lat: 28.6289, lng: 77.2250 }, crew: 3 },
    { id: 'AMB-007', status: 'available', location: { lat: 28.6139, lng: 77.1900 }, crew: 2 },
    { id: 'AMB-008', status: 'available', location: { lat: 28.6339, lng: 77.2300 }, crew: 3 },
  ];

  // Mock data for emergencies
  const mockEmergencies = [
    { id: 'EMG-001', type: 'Heart Attack', priority: 'critical', location: { lat: 28.6200, lng: 77.2100 } },
    { id: 'EMG-002', type: 'Traffic Accident', priority: 'high', location: { lat: 28.6150, lng: 77.2050 } },
    { id: 'EMG-003', type: 'Medical Emergency', priority: 'medium', location: { lat: 28.6250, lng: 77.2180 } },
  ];

  // Initialize map and data
  useEffect(() => {
    setAmbulances(mockAmbulances);
    setEmergencies(mockEmergencies);
    
    // Calculate stats
    const available = mockAmbulances.filter(a => a.status === 'available').length;
    setStats(prev => ({
      ...prev,
      activeAmbulances: mockAmbulances.length,
      activeEmergencies: mockEmergencies.length,
      avgResponseTime: '8m',
      hospitals: 7,
      confidenceLevel: 'High (92%)',
      weather: 'Light Rain',
      weatherDesc: 'Wet roads, visibility moderate',
    }));

    // Fetch real traffic data from TomTom API
    const fetchTrafficData = async () => {
      try {
        const bbox = '77.1,28.5,77.3,28.7'; // Bounding box for New Delhi
        const response = await fetch(
          `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=28.6139,77.2090&key=JXPnqva3lZanMKstFTttkppZnHor4IXr`
        );
        const data = await response.json();
        
        if (data.flowSegmentData) {
          const speed = data.flowSegmentData.currentSpeed;
          const freeFlowSpeed = data.flowSegmentData.freeFlowSpeed;
          const congestionLevel = ((freeFlowSpeed - speed) / freeFlowSpeed * 100).toFixed(0);
          
          let trafficMessage = '';
          if (congestionLevel < 20) {
            trafficMessage = `Traffic is flowing smoothly in New Delhi. Current speed: ${speed} km/h.`;
          } else if (congestionLevel < 50) {
            trafficMessage = `Moderate traffic congestion detected. Current speed: ${speed} km/h (${congestionLevel}% slower than normal).`;
          } else {
            trafficMessage = `Heavy traffic congestion in New Delhi. Current speed: ${speed} km/h (${congestionLevel}% slower than normal).`;
          }
          
          setTrafficData(data.flowSegmentData);
          setStats(prev => ({ ...prev, trafficInfo: trafficMessage }));
        }
      } catch (error) {
        console.error('Failed to fetch traffic data:', error);
        setStats(prev => ({ ...prev, trafficInfo: 'Traffic data unavailable. Using alternative routes.' }));
      }
    };

    fetchTrafficData();
    const trafficInterval = setInterval(fetchTrafficData, 300000); // Update every 5 minutes

    return () => clearInterval(trafficInterval);
  }, []);

  const handleLayerToggle = (event, newLayers) => {
    if (newLayers !== null) {
      setMapLayers(newLayers);
    }
  };

  // Initialize TomTom map (only once)
  useEffect(() => {
    if (ambulances.length === 0) return; // Wait for ambulances to be loaded
    
    const timer = setTimeout(() => {
      const mapContainer = document.getElementById('dashboard-map-container');
      if (!mapContainer || !window.tt || dashboardMap) return;

      const map = window.tt.map({
        key: 'JXPnqva3lZanMKstFTttkppZnHor4IXr',
        container: 'dashboard-map-container',
        center: [77.2090, 28.6139],
        zoom: 12,
      });

      setDashboardMap(map);
      const markers = [];

      // Add ambulance markers
      ambulances.forEach((ambulance) => {
        const color = ambulance.status === 'available' ? '#10b981' : 
                      ambulance.status === 'enroute' ? '#3b82f6' : '#f59e0b';
        
        const marker = new window.tt.Marker({
          element: createAmbulanceMarker(ambulance.id, color),
        })
          .setLngLat([ambulance.location.lng, ambulance.location.lat])
          .addTo(map);

        const popup = new window.tt.Popup({ offset: 35 }).setHTML(
          `<div style="padding: 8px;">
            <strong>${ambulance.id}</strong><br/>
            Status: ${ambulance.status}<br/>
            Crew: ${ambulance.crew}
          </div>`
        );
        marker.setPopup(popup);
        
        markers.push({ marker, ambulance });
      });

      setAmbulanceMarkers(markers);

      // Add emergency markers
      emergencies.forEach((emergency) => {
        const color = emergency.priority === 'critical' ? '#ef4444' : 
                      emergency.priority === 'high' ? '#f97316' : '#eab308';
        
        const marker = new window.tt.Marker({
          element: createEmergencyMarker(color),
        })
          .setLngLat([emergency.location.lng, emergency.location.lat])
          .addTo(map);

        const popup = new window.tt.Popup({ offset: 35 }).setHTML(
          `<div style="padding: 8px;">
            <strong>${emergency.id}</strong><br/>
            Type: ${emergency.type}<br/>
            Priority: ${emergency.priority}
          </div>`
        );
        marker.setPopup(popup);
      });

      return () => {
        if (map) map.remove();
      };
    }, 300);

    return () => clearTimeout(timer);
  }, [ambulances, emergencies]); // Re-run when ambulances/emergencies are loaded

  // Animate ambulance movement
  useEffect(() => {
    if (ambulanceMarkers.length === 0) return;

    const animationInterval = setInterval(() => {
      ambulanceMarkers.forEach(({ marker, ambulance }) => {
        // Only move ambulances that are enroute or available
        if (ambulance.status === 'onscene') return;

        // Generate small random movement (very slow, natural drift)
        const latChange = (Math.random() - 0.5) * 0.0003; // ~30 meters
        const lngChange = (Math.random() - 0.5) * 0.0003;

        const newLocation = {
          lat: ambulance.location.lat + latChange,
          lng: ambulance.location.lng + lngChange,
        };

        // Update marker position smoothly
        marker.setLngLat([newLocation.lng, newLocation.lat]);
        
        // Update ambulance data
        ambulance.location = newLocation;
      });
    }, 5000); // Update every 5 seconds for slow, natural movement

    return () => clearInterval(animationInterval);
  }, [ambulanceMarkers]);

  const createAmbulanceMarker = (id, color) => {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 32px;
      height: 32px;
      background-color: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 10px;
      color: white;
      cursor: pointer;
    `;
    el.textContent = '🚑';
    return el;
  };

  const createEmergencyMarker = (color) => {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 28px;
      height: 28px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      animation: pulse 2s infinite;
    `;
    el.textContent = '⚠️';
    return el;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <TopNavBar onMenuClick={() => setMobileOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          mt: { xs: 8, md: 0 },
          ml: { md: '260px' },
          height: { xs: 'calc(100vh - 64px)', md: '100vh' },
          bgcolor: '#f8f9fa',
        }}
      >
        {/* Main Map Area */}
        <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Header with Title and New Emergency Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: 'white',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="error"
                startIcon={<Add />}
                onClick={() => navigate('/active-emergencies')}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 1,
                  px: 3,
                }}
              >
                New Emergency
              </Button>
              <IconButton sx={{ bgcolor: '#f3f4f6' }}>
                <Notifications />
              </IconButton>
            </Box>
          </Box>

          {/* Map Section */}
          <Box sx={{ flex: 1, position: 'relative', p: 2 }}>
            <Paper elevation={0} sx={{ height: '100%', border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
              {/* Map Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'white',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Emergency Response Map
                </Typography>
                <ToggleButtonGroup
                  value={mapLayers}
                  onChange={handleLayerToggle}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      px: 2,
                      border: '1px solid #e5e7eb',
                      color: '#6b7280',
                      '&.Mui-selected': {
                        bgcolor: '#f3f4f6',
                        color: '#111827',
                        fontWeight: 600,
                      },
                    },
                  }}
                >
                  <ToggleButton value="traffic">
                    <Traffic sx={{ fontSize: 18, mr: 0.5 }} />
                    Traffic
                  </ToggleButton>
                  <ToggleButton value="hospitals">
                    <LocalHospital sx={{ fontSize: 18, mr: 0.5 }} />
                    Hospitals
                  </ToggleButton>
                  <ToggleButton value="incidents">
                    <Warning sx={{ fontSize: 18, mr: 0.5 }} />
                    Incidents
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Map Container */}
              <Box sx={{ position: 'relative', height: 'calc(100% - 65px)' }}>
                <Box 
                  id="dashboard-map-container" 
                  sx={{ 
                    width: '100%', 
                    height: '100%',
                    bgcolor: '#e5e7eb',
                    '& .mapboxgl-popup-content': {
                      padding: 0,
                      borderRadius: '8px',
                    }
                  }} 
                />
                
                {/* Map Controls */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    zIndex: 1,
                  }}
                >
                  <IconButton
                    sx={{
                      bgcolor: 'white',
                      boxShadow: 1,
                      '&:hover': { bgcolor: '#f9fafb' },
                    }}
                  >
                    <ZoomIn />
                  </IconButton>
                  <IconButton
                    sx={{
                      bgcolor: 'white',
                      boxShadow: 1,
                      '&:hover': { bgcolor: '#f9fafb' },
                    }}
                  >
                    <ZoomOut />
                  </IconButton>
                  <IconButton
                    sx={{
                      bgcolor: 'white',
                      boxShadow: 1,
                      '&:hover': { bgcolor: '#f9fafb' },
                    }}
                  >
                    <Navigation />
                  </IconButton>
                  <IconButton
                    sx={{
                      bgcolor: 'white',
                      boxShadow: 1,
                      '&:hover': { bgcolor: '#f9fafb' },
                    }}
                  >
                    <Fullscreen />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Status Panel Sidebar */}
        <Box
          sx={{
            width: { xs: '100%', md: 340 },
            height: '100%',
            overflow: 'auto',
            bgcolor: 'white',
            borderLeft: '1px solid #e5e7eb',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              System Status
            </Typography>

            {/* Resources Section */}
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="caption" 
                fontWeight={600} 
                sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Resources
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Active Ambulances
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#3b82f6">
                      {stats.activeAmbulances}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Emergencies
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#ef4444">
                      {stats.activeEmergencies}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Avg. Response Time
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#10b981">
                      {stats.avgResponseTime}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#fef3f2', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Hospitals
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#ef4444">
                      {stats.hospitals}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Traffic Prediction Section */}
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="caption" 
                fontWeight={600} 
                sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Traffic Prediction
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Confidence Level
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#10b981">
                    {stats.confidenceLevel}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {stats.trafficInfo}
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    bgcolor: '#e5e7eb',
                    borderRadius: 4,
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: '92%',
                      height: '100%',
                      bgcolor: '#10b981',
                      borderRadius: 4,
                    }}
                  />
                </Box>

                {/* Traffic Details Grid */}
                {trafficData && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Current Speed
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="#10b981">
                          {trafficData.currentSpeed} km/h
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Free Flow
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="#3b82f6">
                          {trafficData.freeFlowSpeed} km/h
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#fef9f5', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Road Name
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {trafficData.roadClosure ? '🚧 Road Closed' : (trafficData.name || 'Main Route')}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {/* Traffic Hotspots */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#6b7280', mb: 1, display: 'block' }}>
                    TRAFFIC HOTSPOTS
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#fef2f2', borderRadius: 1.5 }}>
                      <Box sx={{ width: 6, height: 6, bgcolor: '#ef4444', borderRadius: '50%' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.primary">
                          Connaught Place
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Heavy congestion - 12 min delay
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#fef9f5', borderRadius: 1.5 }}>
                      <Box sx={{ width: 6, height: 6, bgcolor: '#f59e0b', borderRadius: '50%' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.primary">
                          Kashmere Gate
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Moderate traffic - 5 min delay
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1.5 }}>
                      <Box sx={{ width: 6, height: 6, bgcolor: '#10b981', borderRadius: '50%' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.primary">
                          India Gate
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Free flowing - No delays
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Route Recommendations */}
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#eff6ff', borderRadius: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                    <Traffic sx={{ fontSize: 16, color: '#3b82f6', mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="#3b82f6" sx={{ display: 'block' }}>
                        AI RECOMMENDATION
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Use Ring Road for faster response times. Estimated time savings: 8 minutes.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Weather Conditions Section */}
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="caption" 
                fontWeight={600} 
                sx={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Weather Conditions
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: '#eff6ff',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Cloud sx={{ fontSize: 28, color: '#3b82f6' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {stats.weather}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.weatherDesc}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
