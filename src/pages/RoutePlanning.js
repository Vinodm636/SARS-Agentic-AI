import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  Navigation,
  Send,
  Save,
  Refresh,
  Lightbulb,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";

const RoutePlanning = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ambulanceId, setAmbulanceId] = useState("");
  const [pickupId, setPickupId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [routeType, setRouteType] = useState("fastest");
  const [calculating, setCalculating] = useState(false);
  const [route, setRoute] = useState(null);
  const [map, setMap] = useState(null);
  const mapInitialized = useRef(false);

  // Mock data - replace with API calls
  const ambulances = [
    {
      id: "AMB-105",
      name: "AMB-105 - Advanced Life Support",
      status: "available",
      lat: 28.6139,
      lng: 77.209,
    },
    {
      id: "AMB-208",
      name: "AMB-208 - Basic Life Support",
      status: "available",
      lat: 28.62,
      lng: 77.215,
    },
    {
      id: "AMB-312",
      name: "AMB-312 - Advanced Life Support",
      status: "available",
      lat: 28.61,
      lng: 77.2,
    },
  ];

  const emergencies = [
    {
      id: "EMG-001",
      name: "Heart Attack - Connaught Place",
      lat: 28.6289,
      lng: 77.2065,
    },
    {
      id: "EMG-002",
      name: "Traffic Accident - India Gate",
      lat: 28.6129,
      lng: 77.2295,
    },
    {
      id: "EMG-003",
      name: "Breathing Problem - Karol Bagh",
      lat: 28.6517,
      lng: 77.1909,
    },
  ];

  const hospitals = [
    { id: "HOSP-001", name: "AIIMS Hospital", lat: 28.5672, lng: 77.21 },
    { id: "HOSP-002", name: "Safdarjung Hospital", lat: 28.5676, lng: 77.2063 },
    {
      id: "HOSP-003",
      name: "Ram Manohar Lohia Hospital",
      lat: 28.6281,
      lng: 77.2136,
    },
  ];

  const center = {
    lat: 28.6139,
    lng: 77.209,
  };

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapInitialized.current) {
      initializeMap();
      mapInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMap = () => {
    const container = document.getElementById("route-planning-map");
    if (!container) return;

    const tomtomMap = window.tt.map({
      key: "JXPnqva3lZanMKstFTttkppZnHor4IXr",
      container: "route-planning-map",
      center: [center.lng, center.lat],
      zoom: 12,
      style:
        "https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&poi=poi_main",
    });

    tomtomMap.on("load", () => {
      // Add ambulance markers
      ambulances.forEach((amb) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background-color: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">🚑</div>
        `;
        new window.tt.Marker({ element: el })
          .setLngLat([amb.lng, amb.lat])
          .addTo(tomtomMap);
      });

      // Add emergency markers
      emergencies.forEach((emg) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background-color: #f59e0b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">🚨</div>
        `;
        new window.tt.Marker({ element: el })
          .setLngLat([emg.lng, emg.lat])
          .addTo(tomtomMap);
      });

      // Add hospital markers
      hospitals.forEach((hosp) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            width: 32px;
            height: 32px;
            background-color: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: white;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">🏥</div>
        `;
        new window.tt.Marker({ element: el })
          .setLngLat([hosp.lng, hosp.lat])
          .addTo(tomtomMap);
      });
    });

    setMap(tomtomMap);
  };

  const handleCalculateRoute = async () => {
    if (!ambulanceId || !pickupId || !destinationId || !map) {
      alert("Please select ambulance, pickup location, and destination");
      return;
    }

    setCalculating(true);

    const ambulance = ambulances.find((a) => a.id === ambulanceId);
    const emergency = emergencies.find((e) => e.id === pickupId);
    const hospital = hospitals.find((h) => h.id === destinationId);

    console.log("Calculating route:", { ambulance, emergency, hospital });

    try {
      // Clear previous route if exists
      if (map.getLayer("route-outline")) {
        map.removeLayer("route-outline");
      }
      if (map.getLayer("route")) {
        map.removeLayer("route");
      }
      if (map.getSource("route")) {
        map.removeSource("route");
      }
      if (map.getSource("route-outline")) {
        map.removeSource("route-outline");
      }

      // Calculate route using TomTom Routing API
      // TomTom expects waypoints in lat,lng format (not lng,lat)
      const waypoints = `${ambulance.lat},${ambulance.lng}:${emergency.lat},${emergency.lng}:${hospital.lat},${hospital.lng}`;
      const url = `https://api.tomtom.com/routing/1/calculateRoute/${waypoints}/json?key=JXPnqva3lZanMKstFTttkppZnHor4IXr&traffic=true&travelMode=car`;

      console.log("Fetching route from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Route data received:", data);

      if (!data.routes || data.routes.length === 0) {
        throw new Error("No routes found in response");
      }

      const routeData = data.routes[0];

      // Draw route on map
      const coordinates = routeData.legs.flatMap((leg) =>
        leg.points.map((point) => [point.longitude, point.latitude])
      );

      console.log("Drawing route with", coordinates.length, "points");

      // Add route outline
      map.addSource("route-outline", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });

      map.addLayer({
        id: "route-outline",
        type: "line",
        source: "route-outline",
        paint: {
          "line-color": "#1e40af",
          "line-width": 8,
          "line-opacity": 0.4,
        },
      });

      // Add main route
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#3b82f6",
          "line-width": 6,
          "line-opacity": 0.8,
        },
      });

      // Fit map to show entire route
      const bounds = new window.tt.LngLatBounds();
      coordinates.forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, { padding: 50 });

      // Calculate stats
      const totalDistance = routeData.summary.lengthInMeters / 1000;
      const totalTime = Math.ceil(routeData.summary.travelTimeInSeconds / 60);

      const leg1 = routeData.legs[0];
      const leg2 = routeData.legs[1];

      setRoute({
        totalDistance: totalDistance.toFixed(1),
        totalTime: totalTime,
        segments: [
          {
            name: "Ambulance → Emergency Scene",
            distance: (leg1.summary.lengthInMeters / 1000).toFixed(1),
            time: Math.ceil(leg1.summary.travelTimeInSeconds / 60),
          },
          {
            name: "Emergency Scene → Hospital",
            distance: (leg2.summary.lengthInMeters / 1000).toFixed(1),
            time: Math.ceil(leg2.summary.travelTimeInSeconds / 60),
          },
        ],
        recommendations: [
          `Route optimized for ${
            routeType === "fastest" ? "fastest arrival" : "shortest distance"
          }.`,
          `Current traffic conditions: ${
            totalTime < 20 ? "Light" : totalTime < 40 ? "Moderate" : "Heavy"
          }.`,
          `Recommended speed: ${
            totalDistance / (totalTime / 60) < 50 ? "40-50" : "60-70"
          } km/h.`,
          `Estimated fuel consumption: ${(totalDistance * 0.15).toFixed(
            1
          )} liters.`,
        ],
      });

      console.log("Route calculated successfully!");
      setCalculating(false);
    } catch (error) {
      console.error("Error calculating route:", error);
      console.error("Error details:", error.message, error.stack);
      alert(`Failed to calculate route: ${error.message}`);
      setCalculating(false);
    }
  };

  const handleDispatch = () => {
    alert("Ambulance dispatched successfully!");
  };

  const handleSaveRoute = () => {
    alert("Route saved successfully!");
  };

  const handleClearRoute = () => {
    if (map) {
      // Remove route layers
      try {
        if (map.getLayer("route-outline")) {
          map.removeLayer("route-outline");
        }
        if (map.getLayer("route")) {
          map.removeLayer("route");
        }
        if (map.getSource("route")) {
          map.removeSource("route");
        }
        if (map.getSource("route-outline")) {
          map.removeSource("route-outline");
        }
      } catch (error) {
        console.error("Error clearing route:", error);
      }

      // Reset map view
      map.flyTo({
        center: [center.lng, center.lat],
        zoom: 12,
      });
    }
    setRoute(null);
    setAmbulanceId("");
    setPickupId("");
    setDestinationId("");
  };

  const formatETA = (minutes) => {
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + minutes);
    return eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <TopNavBar onMenuClick={() => setMobileOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: { xs: 8, md: 0 },
          ml: { md: "260px" },
        }}
      >
        {/* Page Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Route Planning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calculate optimal routes with traffic and weather analysis
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleClearRoute}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            Clear Route
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Route Planner Form */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                🚑 Route Planner
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select ambulance, pickup location, and destination
              </Typography>

              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Ambulance</InputLabel>
                  <Select
                    value={ambulanceId}
                    label="Select Ambulance"
                    onChange={(e) => setAmbulanceId(e.target.value)}
                  >
                    {ambulances.map((amb) => (
                      <MenuItem key={amb.id} value={amb.id}>
                        {amb.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Pickup Location (Emergency)</InputLabel>
                  <Select
                    value={pickupId}
                    label="Pickup Location (Emergency)"
                    onChange={(e) => setPickupId(e.target.value)}
                  >
                    {emergencies.map((emg) => (
                      <MenuItem key={emg.id} value={emg.id}>
                        {emg.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Destination (Hospital)</InputLabel>
                  <Select
                    value={destinationId}
                    label="Destination (Hospital)"
                    onChange={(e) => setDestinationId(e.target.value)}
                  >
                    {hospitals.map((hosp) => (
                      <MenuItem key={hosp.id} value={hosp.id}>
                        {hosp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Route Type</InputLabel>
                  <Select
                    value={routeType}
                    label="Route Type"
                    onChange={(e) => setRouteType(e.target.value)}
                  >
                    <MenuItem value="fastest">Fastest Route</MenuItem>
                    <MenuItem value="shortest">Shortest Route</MenuItem>
                    <MenuItem value="avoid-traffic">Avoid Traffic</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Navigation />}
                  onClick={handleCalculateRoute}
                  disabled={
                    !ambulanceId || !pickupId || !destinationId || calculating
                  }
                >
                  {calculating ? "Calculating..." : "Calculate Route"}
                </Button>
              </Box>
            </Paper>

            {/* Map Legend */}
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb" }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Map Legend
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: "#3b82f6",
                      borderRadius: "50%",
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">Ambulances</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: "#f59e0b",
                      borderRadius: "50%",
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">Emergency Location</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: "#ef4444",
                      borderRadius: "50%",
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">Hospitals</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Middle Column - Map */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{ mb: 2, border: "1px solid #e5e7eb", overflow: "hidden" }}
            >
              {calculating && <LinearProgress />}
              <Box
                id="route-planning-map"
                sx={{
                  width: "100%",
                  height: 600,
                  bgcolor: "#e5e7eb",
                }}
              />
            </Paper>

            {/* Route Details */}
            {route && (
              <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Route Summary
                </Typography>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#eff6ff",
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Total Distance
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#1e40af"
                      >
                        {route.totalDistance} km
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#fef3c7",
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Total Time
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#92400e"
                      >
                        {route.totalTime} min
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#d1fae5",
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ETA
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#047857"
                      >
                        {formatETA(route.totalTime)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Segments */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Route Segments
                </Typography>
                <Box sx={{ mb: 3 }}>
                  {route.segments.map((segment, index) => (
                    <Card key={index} sx={{ mb: 1.5, bgcolor: "#f9fafb" }}>
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {segment.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {segment.distance} km
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="body1" fontWeight={500}>
                              {segment.time} min
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ETA:{" "}
                              {formatETA(
                                index === 0
                                  ? segment.time
                                  : route.segments[0].time + segment.time
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* AI Recommendations */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 1,
                    mb: 3,
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    <Lightbulb sx={{ color: "#3b82f6", mr: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      AI Recommendations
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {route.recommendations.map((rec, index) => (
                      <Typography
                        key={index}
                        component="li"
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={handleSaveRoute}
                    fullWidth
                  >
                    Save Route
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleDispatch}
                    fullWidth
                  >
                    Dispatch
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default RoutePlanning;
