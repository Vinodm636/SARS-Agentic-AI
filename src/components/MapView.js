import React, { useState, useEffect, useCallback } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from '@react-google-maps/api';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  LocalHospital,
  Speed,
  AccessTime,
  CheckCircle,
} from '@mui/icons-material';
import { ambulanceAPI, mapsAPI } from '../services/api';

/**
 * MapView Component
 * Displays ambulances on map, calculates routes and ETA
 * Allows selection of optimal ambulance
 */
const MapView = ({ patientLocation, onAmbulanceSelect }) => {
  const [map, setMap] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [directions, setDirections] = useState({});
  const [etaData, setEtaData] = useState([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '600px',
  };

  const defaultCenter = {
    lat: 28.6139, // Delhi default
    lng: 77.2090,
  };

  const [center, setCenter] = useState(defaultCenter);

  // Load ambulances
  useEffect(() => {
    loadAmbulances();
    
    // Refresh ambulance locations every 10 seconds
    const interval = setInterval(loadAmbulances, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate routes when patient location is available
  useEffect(() => {
    if (patientLocation && patientLocation.latitude && patientLocation.longitude && ambulances.length > 0) {
      setCenter({
        lat: patientLocation.latitude,
        lng: patientLocation.longitude,
      });
      calculateRoutesAndETA();
    }
  }, [patientLocation, ambulances]);

  const loadAmbulances = async () => {
    try {
      const response = await ambulanceAPI.getAllAmbulances();
      // Filter only available ambulances
      const availableAmbulances = response.filter(amb => amb.status === 'available');
      setAmbulances(availableAmbulances);
    } catch (error) {
      console.error('Failed to load ambulances:', error);
    }
  };

  const calculateRoutesAndETA = async () => {
    if (!patientLocation || !ambulances.length) return;

    const destination = {
      lat: patientLocation.latitude,
      lng: patientLocation.longitude,
    };

    const etaResults = [];

    // Calculate route for each ambulance
    for (const ambulance of ambulances) {
      const origin = {
        lat: ambulance.current_location.latitude,
        lng: ambulance.current_location.longitude,
      };

      // Use Google Directions Service
      const directionsService = new window.google.maps.DirectionsService();
      
      try {
        const result = await directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: 'bestguess',
          },
        });

        if (result.routes[0]) {
          const route = result.routes[0].legs[0];
          const etaMinutes = Math.ceil(route.duration_in_traffic?.value / 60 || route.duration.value / 60);
          
          etaResults.push({
            ambulance_id: ambulance.ambulance_id,
            vehicle_number: ambulance.vehicle_number,
            distance_km: (route.distance.value / 1000).toFixed(2),
            eta_minutes: etaMinutes,
            distance_text: route.distance.text,
            duration_text: route.duration_in_traffic?.text || route.duration.text,
          });

          // Store directions for rendering
          setDirections(prev => ({
            ...prev,
            [ambulance.ambulance_id]: result,
          }));
        }
      } catch (error) {
        console.error(`Failed to calculate route for ${ambulance.vehicle_number}:`, error);
      }
    }

    // Sort by ETA (fastest first)
    etaResults.sort((a, b) => a.eta_minutes - b.eta_minutes);
    setEtaData(etaResults);
  };

  const handleAmbulanceClick = (ambulance) => {
    setActiveInfoWindow(ambulance.ambulance_id);
  };

  const handleSelectAmbulance = (ambulance, eta) => {
    const selectedData = {
      ...ambulance,
      eta: `${eta.eta_minutes} min`,
      distance: eta.distance_text,
    };
    setSelectedAmbulance(ambulance.ambulance_id);
    if (onAmbulanceSelect) {
      onAmbulanceSelect(selectedData);
    }
  };

  const getMarkerIcon = (status, isSelected) => {
    if (isSelected) {
      return {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new window.google.maps.Size(50, 50),
      };
    }
    return {
      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: new window.google.maps.Size(40, 40),
    };
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ mb: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            onLoad={setMap}
            options={{
              streetViewControl: false,
              mapTypeControl: true,
            }}
          >
            {/* Patient Location Marker */}
            {patientLocation && patientLocation.latitude && (
              <Marker
                position={{
                  lat: patientLocation.latitude,
                  lng: patientLocation.longitude,
                }}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(50, 50),
                }}
                label={{
                  text: '🏥 Patient',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            )}

            {/* Ambulance Markers */}
            {ambulances.map((ambulance) => (
              <React.Fragment key={ambulance.ambulance_id}>
                <Marker
                  position={{
                    lat: ambulance.current_location.latitude,
                    lng: ambulance.current_location.longitude,
                  }}
                  icon={getMarkerIcon(ambulance.status, selectedAmbulance === ambulance.ambulance_id)}
                  onClick={() => handleAmbulanceClick(ambulance)}
                  label={{
                    text: '🚑',
                    fontSize: '20px',
                  }}
                />

                {activeInfoWindow === ambulance.ambulance_id && (
                  <InfoWindow
                    position={{
                      lat: ambulance.current_location.latitude,
                      lng: ambulance.current_location.longitude,
                    }}
                    onCloseClick={() => setActiveInfoWindow(null)}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {ambulance.vehicle_number}
                      </Typography>
                      <Typography variant="caption">
                        Driver: {ambulance.driver_name}
                      </Typography>
                      <br />
                      <Typography variant="caption">
                        Status: <Chip label={ambulance.status} size="small" color="success" />
                      </Typography>
                    </Box>
                  </InfoWindow>
                )}

                {/* Draw route for selected ambulance */}
                {selectedAmbulance === ambulance.ambulance_id && directions[ambulance.ambulance_id] && (
                  <DirectionsRenderer
                    directions={directions[ambulance.ambulance_id]}
                    options={{
                      polylineOptions: {
                        strokeColor: '#4caf50',
                        strokeWeight: 5,
                      },
                      suppressMarkers: true,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </GoogleMap>
        </LoadScript>
      </Paper>

      {/* ETA List */}
      {etaData.length > 0 && (
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e5e7eb' }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            🚑 Available Ambulances (Sorted by ETA)
          </Typography>
          <List>
            {etaData.map((eta, index) => {
              const ambulance = ambulances.find(a => a.ambulance_id === eta.ambulance_id);
              const isSelected = selectedAmbulance === eta.ambulance_id;
              
              return (
                <React.Fragment key={eta.ambulance_id}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => handleSelectAmbulance(ambulance, eta)}
                    sx={{
                      borderLeft: isSelected ? '4px solid #4caf50' : 'none',
                      backgroundColor: isSelected ? '#e8f5e9' : 'transparent',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {eta.vehicle_number}
                          </Typography>
                          {index === 0 && <Chip label="Fastest" color="success" size="small" />}
                          {isSelected && <CheckCircle color="success" />}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <AccessTime fontSize="small" />
                            <Typography variant="body2">
                              ETA: <strong>{eta.eta_minutes} minutes</strong> ({eta.duration_text})
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Speed fontSize="small" />
                            <Typography variant="body2">
                              Distance: {eta.distance_text}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <LocalHospital fontSize="small" />
                            <Typography variant="body2">
                              Features: {ambulance?.features.join(', ') || 'Basic'}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                  {index < etaData.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      )}

      {/* No ambulances message */}
      {ambulances.length === 0 && (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px solid #e5e7eb' }}>
          <Typography variant="body1" color="text.secondary">
            No ambulances available at the moment. Please try again.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MapView;
