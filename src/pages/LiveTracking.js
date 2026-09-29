import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  Close,
  LocalShipping,
  Speed,
  Timer,
  Navigation as NavigationIcon,
  Air,
  Visibility,
  WbSunny,
  Cloud,
  Opacity,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const LiveTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { emergency } = location.state || {};

  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingMap, setTrackingMap] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [ambulancePosition, setAmbulancePosition] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [actualRouteDistance, setActualRouteDistance] = useState(0);

  // Use refs to hold latest values without causing re-renders
  const routeCoordinatesRef = useRef([]);
  const trackingMapRef = useRef(null);
  const actualRouteDistanceRef = useRef(0);
  const currentRouteIndexRef = useRef(0);

  // Keep refs updated
  useEffect(() => {
    routeCoordinatesRef.current = routeCoordinates;
    trackingMapRef.current = trackingMap;
    actualRouteDistanceRef.current = actualRouteDistance;
    currentRouteIndexRef.current = currentRouteIndex;
  }, [routeCoordinates, trackingMap, actualRouteDistance, currentRouteIndex]);

  // Load saved tracking state or use defaults
  const getInitialTrackingState = () => {
    if (!emergency) return { progress: 0, eta: 15, speed: 45, distance: 12.5 };

    const saved = localStorage.getItem(`tracking_${emergency.id}`);
    if (saved) {
      return JSON.parse(saved);
    }

    // Use emergency's ETA if available, otherwise default to 15
    const initialEta = emergency.timeEstimatedArrival
      ? parseFloat(
          emergency.timeEstimatedArrival.toString().replace(/[^0-9.]/g, "")
        ) || 15
      : 15;

    // Calculate realistic distance and speed based on ETA
    // Assume average ambulance speed in city: 35-40 km/h
    // Distance = Speed × Time (in hours)
    const avgSpeed = 36; // km/h
    const initialDistance = (avgSpeed * initialEta) / 60; // Convert minutes to hours

    return {
      progress: 0,
      eta: initialEta,
      speed: avgSpeed,
      distance: initialDistance,
    };
  };

  const initialState = getInitialTrackingState();
  const [progress, setProgress] = useState(initialState.progress);
  const [eta, setEta] = useState(initialState.eta);
  const [speed, setSpeed] = useState(initialState.speed);
  const [distance, setDistance] = useState(initialState.distance);
  const mapInitialized = useRef(false);

  // Real-time speed data for graph
  // eslint-disable-next-line no-unused-vars
  const [speedData, setSpeedData] = useState([
    { time: "0:00", speed: 0 },
    { time: "0:30", speed: 25 },
    { time: "1:00", speed: 40 },
    { time: "1:30", speed: 55 },
    { time: "2:00", speed: 45 },
    { time: "2:30", speed: 50 },
  ]);

  // ETA prediction data
  // eslint-disable-next-line no-unused-vars
  const [etaData, setEtaData] = useState([
    { time: "0:00", predicted: 18, actual: 18 },
    { time: "0:30", predicted: 17, actual: 17 },
    { time: "1:00", predicted: 16, actual: 15 },
    { time: "1:30", predicted: 14, actual: 14 },
    { time: "2:00", predicted: 12, actual: 13 },
    { time: "2:30", predicted: 10, actual: 11 },
  ]);

  // Response time breakdown
  const responseBreakdown = [
    { name: "Dispatch Time", value: 2, color: "#3b82f6" },
    { name: "Travel Time", value: 13, color: "#10b981" },
    { name: "On Scene", value: 0, color: "#f59e0b" },
  ];

  // Weather data
  // eslint-disable-next-line no-unused-vars
  const [weather, setWeather] = useState({
    temp: 24,
    humidity: 65,
    windSpeed: 12,
    visibility: 8,
    condition: "Partly Cloudy",
    precipitation: 10,
  });

  // Traffic data
  // eslint-disable-next-line no-unused-vars
  const [trafficData, setTrafficData] = useState([
    { segment: "Start", congestion: 15 },
    { segment: "Sector 1", congestion: 45 },
    { segment: "Sector 2", congestion: 75 },
    { segment: "Sector 3", congestion: 30 },
    { segment: "Destination", congestion: 20 },
  ]);

  // Define initializeTracking function before it's used
  const initializeTracking = useCallback(() => {
    const container = document.getElementById("live-tracking-map-container");

    console.log("initializeTracking called, container:", container);
    console.log("mapInitialized.current:", mapInitialized.current);

    if (!container) {
      console.error("Map container not found!");
      return;
    }

    if (mapInitialized.current) {
      console.log("Map already initialized, skipping");
      return;
    }

    // Check if TomTom SDK is loaded
    if (!window.tt) {
      console.error("TomTom SDK not loaded, retrying...");
      setTimeout(initializeTracking, 500);
      return;
    }

    const patientLocation = { lat: 28.62, lng: 77.21 };
    const ambulanceStart = { lat: 28.605, lng: 77.215 };

    setAmbulancePosition(ambulanceStart);

    console.log("Initializing TomTom map...");

    try {
      // Initialize TomTom map
      const map = window.tt.map({
        key: "JXPnqva3lZanMKstFTttkppZnHor4IXr",
        container: "live-tracking-map-container",
        center: [77.2125, 28.6125],
        zoom: 13,
        style:
          "https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&poi=poi_main",
      });

      console.log("Map object created:", map);

      map.on("load", async () => {
        console.log("Map loaded successfully");
        try {
          // Fetch real route from TomTom Routing API
          const apiKey = "JXPnqva3lZanMKstFTttkppZnHor4IXr";
          const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${ambulanceStart.lat},${ambulanceStart.lng}:${patientLocation.lat},${patientLocation.lng}/json?key=${apiKey}&traffic=true&routeType=fastest&travelMode=car`;

          console.log("Fetching route from TomTom API...");
          const response = await fetch(routeUrl);
          const data = await response.json();

          console.log("Route API response:", data);

          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const routePoints = route.legs[0].points.map((point) => [
              point.longitude,
              point.latitude,
            ]);

            // Store route coordinates for animation
            setRouteCoordinates(routePoints);
            setCurrentRouteIndex(0);

            // Get actual route distance in kilometers
            const distanceInMeters = route.summary.lengthInMeters;
            const distanceInKm = distanceInMeters / 1000;
            setActualRouteDistance(distanceInKm);

            // Update initial distance based on actual route
            setDistance(distanceInKm);

            console.log(
              `Route loaded: ${distanceInKm.toFixed(2)} km, ${
                routePoints.length
              } points`
            );

            // Add route line using actual route coordinates
            map.addLayer({
              id: "route",
              type: "line",
              source: {
                type: "geojson",
                data: {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: routePoints,
                  },
                },
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 4,
                "line-opacity": 0.8,
              },
            });
          } else {
            console.error("No route found, using fallback");
            // Fallback to straight line if routing fails
            const fallbackRoute = [
              [ambulanceStart.lng, ambulanceStart.lat],
              [patientLocation.lng, patientLocation.lat],
            ];
            setRouteCoordinates(fallbackRoute);

            map.addLayer({
              id: "route",
              type: "line",
              source: {
                type: "geojson",
                data: {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: fallbackRoute,
                  },
                },
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 4,
                "line-opacity": 0.8,
              },
            });
          }
        } catch (error) {
          console.error("Error fetching route:", error);
          // Fallback route
          const fallbackRoute = [
            [ambulanceStart.lng, ambulanceStart.lat],
            [patientLocation.lng, patientLocation.lat],
          ];
          setRouteCoordinates(fallbackRoute);

          map.addLayer({
            id: "route",
            type: "line",
            source: {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: fallbackRoute,
                },
              },
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 4,
              "line-opacity": 0.8,
            },
          });
        }

        // Add patient marker
        const patientMarkerElement = document.createElement("div");
        patientMarkerElement.innerHTML = `
        <div style="
          width: 48px;
          height: 48px;
          background-color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: white;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          animation: pulse 2s infinite;
        ">🚨</div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.85; }
          }
        </style>
      `;

        new window.tt.Marker({ element: patientMarkerElement })
          .setLngLat([patientLocation.lng, patientLocation.lat])
          .addTo(map);

        // Add ambulance marker (will be updated)
        const ambulanceMarkerElement = document.createElement("div");
        ambulanceMarkerElement.id = "ambulance-marker";
        ambulanceMarkerElement.innerHTML = `
        <div style="
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        ">🚑</div>
      `;

        const ambulanceMarker = new window.tt.Marker({
          element: ambulanceMarkerElement,
        })
          .setLngLat([ambulanceStart.lng, ambulanceStart.lat])
          .addTo(map);

        map.ambulanceMarker = ambulanceMarker;
        setTrackingMap(map);
        mapInitialized.current = true;
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, []); // Empty dependency array since this only needs to run once

  // Define update functions before they are used
  const updateAmbulancePosition = useCallback(() => {
    try {
      if (routeCoordinatesRef.current.length === 0) return;

      // Use progress state to determine position instead of incrementing index
      setProgress((currentProgress) => {
        if (currentProgress >= 100) return currentProgress;

        const totalPoints = routeCoordinatesRef.current.length;
        const targetIndex = Math.floor((currentProgress / 100) * totalPoints);
        const safeIndex = Math.min(targetIndex, totalPoints - 1);

        setCurrentRouteIndex(safeIndex);

        const [lng, lat] = routeCoordinatesRef.current[safeIndex];

        // Update marker on map
        if (trackingMapRef.current && trackingMapRef.current.ambulanceMarker) {
          trackingMapRef.current.ambulanceMarker.setLngLat([lng, lat]);
        }

        setAmbulancePosition({ lat, lng });

        return currentProgress;
      });
    } catch (error) {
      console.error("Error updating ambulance position:", error);
    }
  }, []); // No dependencies - uses refs

  const updateMetrics = useCallback(() => {
    try {
      let shouldStop = false;

      setProgress((prev) => {
        const newProgress = Math.min(prev + 2, 100);
        if (newProgress >= 100) {
          shouldStop = true;
        }
        return newProgress;
      });

      if (shouldStop) {
        setEta(0);
        setSpeed(0);
        setDistance(0);
        return;
      }

      // Update ETA - decrease by actual time passed (2 seconds = 2/60 minutes)
      setEta((prev) => {
        return Math.max(prev - 2 / 60, 0); // 2 seconds = 0.0333 minutes
      });

      // Speed varies realistically between 30-50 km/h for city ambulance
      setSpeed((prev) => {
        const baseSpeed = 36;
        const variation = (Math.random() - 0.5) * 10; // ±5 km/h
        return Math.max(30, Math.min(50, baseSpeed + variation));
      });

      // Update distance based on progress (synchronized)
      setDistance(() => {
        if (actualRouteDistanceRef.current > 0) {
          setProgress((currentProgress) => {
            // Calculate remaining distance based on progress percentage
            const remainingDistance =
              actualRouteDistanceRef.current * (1 - currentProgress / 100);
            setDistance(Math.max(remainingDistance, 0));
            return currentProgress;
          });
          return 0; // Will be updated in the callback above
        }
        return 0;
      });

      // Update speed chart
      setSpeedData((prev) => {
        try {
          if (!prev || prev.length === 0) return prev;

          const newData = [...prev];
          const lastTime = prev[prev.length - 1]?.time;

          if (!lastTime) return prev;

          const timeParts = lastTime.split(":");
          if (timeParts.length !== 2) return prev;

          const min = parseInt(timeParts[0], 10);
          const sec = parseInt(timeParts[1], 10);

          if (isNaN(min) || isNaN(sec)) return prev;

          const newSec = sec + 30;
          const newMin = min + Math.floor(newSec / 60);
          const adjustedSec = newSec % 60;
          const newTime = `${newMin}:${String(adjustedSec).padStart(2, "0")}`;

          // Realistic speed variation 30-50 km/h
          const baseSpeed = 36;
          const variation = (Math.random() - 0.5) * 10;
          newData.push({
            time: newTime,
            speed: Math.max(30, Math.min(50, baseSpeed + variation)),
          });
          if (newData.length > 10) newData.shift();
          return newData;
        } catch (error) {
          console.error("Error updating speed data:", error);
          return prev;
        }
      });
    } catch (error) {
      console.error("Error updating metrics:", error);
    }
  }, []); // No dependencies - uses refs

  // Save tracking state to localStorage whenever it changes
  useEffect(() => {
    if (emergency && progress > 0) {
      const trackingState = { progress, eta, speed, distance };
      localStorage.setItem(
        `tracking_${emergency.id}`,
        JSON.stringify(trackingState)
      );
    }
  }, [emergency, progress, eta, speed, distance]);

  useEffect(() => {
    if (!emergency) {
      navigate("/active-emergencies");
      return;
    }

    // Only initialize once
    if (!mapInitialized.current) {
      initializeTracking();
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      try {
        // Check progress in the interval, don't depend on it in useEffect
        setProgress((currentProgress) => {
          if (currentProgress >= 100) {
            clearInterval(interval);
            return currentProgress;
          }
          return currentProgress;
        });

        updateAmbulancePosition();
        updateMetrics();
      } catch (error) {
        console.error("Error in tracking interval:", error);
        clearInterval(interval);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      // Don't remove the map on cleanup - let it persist
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergency]);

  if (!emergency) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <TopNavBar onMenuClick={() => setMobileOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: 8, md: 0 },
          ml: { md: "260px" },
          minHeight: "100vh",
          bgcolor: "#f3f4f6",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Live Ambulance Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {emergency.id} - {emergency.assignedAmbulanceId} en route
            </Typography>
          </Box>
          <IconButton onClick={() => navigate("/active-emergencies")}>
            <Close />
          </IconButton>
        </Box>

        <Grid container spacing={2.5} sx={{ px: 2 }}>
          {/* Top Metrics Row */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.9,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontWeight: 600,
                          }}
                        >
                          ETA
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight={700}
                          sx={{ my: 0.5 }}
                        >
                          {eta.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          minutes remaining
                        </Typography>
                      </Box>
                      <Timer sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(240, 147, 251, 0.4)",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.9,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontWeight: 600,
                          }}
                        >
                          Current Speed
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight={700}
                          sx={{ my: 0.5 }}
                        >
                          {speed.toFixed(0)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          km/h
                        </Typography>
                      </Box>
                      <Speed sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(79, 172, 254, 0.4)",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.9,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontWeight: 600,
                          }}
                        >
                          Distance Left
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight={700}
                          sx={{ my: 0.5 }}
                        >
                          {distance.toFixed(1)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          kilometers
                        </Typography>
                      </Box>
                      <NavigationIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(250, 112, 154, 0.4)",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.9,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontWeight: 600,
                          }}
                        >
                          Status
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight={700}
                          sx={{ my: 0.5 }}
                        >
                          EN ROUTE
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          actively responding
                        </Typography>
                      </Box>
                      <LocalShipping sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Main Content Row */}
          <Grid item xs={12}>
            {/* Live Map */}
            <Paper
              elevation={3}
              sx={{
                mb: 2.5,
                overflow: "hidden",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#10b981",
                      mr: 1.5,
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.5 },
                      },
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    Live Location Tracking
                  </Typography>
                </Box>
                <Chip
                  label={`${progress.toFixed(0)}% Journey Complete`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                    backdropFilter: "blur(10px)",
                  }}
                />
              </Box>
              <Box
                id="live-tracking-map-container"
                sx={{
                  width: "100%",
                  height: 550,
                  bgcolor: "#e5e7eb",
                  position: "relative",
                }}
              />
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Journey Progress
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "white",
                      bgcolor: "#3b82f6",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                    }}
                  >
                    {progress.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#e5e7eb",
                    "& .MuiLinearProgress-bar": {
                      background:
                        "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            </Paper>

            {/* Charts Row */}
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                {/* Weather Card */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                    background:
                      "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: "#dbeafe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1.5,
                      }}
                    >
                      <Cloud sx={{ color: "#3b82f6", fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="text.primary"
                      >
                        Weather Impact
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Current conditions
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                    sx={{ bgcolor: "white", p: 2, borderRadius: 2 }}
                  >
                    <Cloud sx={{ fontSize: 48, color: "#6b7280", mr: 2 }} />
                    <Box>
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        color="text.primary"
                      >
                        {weather.temp}°C
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {weather.condition}
                      </Typography>
                    </Box>
                  </Box>
                  <Grid container spacing={1.5}>
                    {[
                      {
                        icon: <Opacity />,
                        label: "Humidity",
                        value: `${weather.humidity}%`,
                        color: "#3b82f6",
                      },
                      {
                        icon: <Air />,
                        label: "Wind",
                        value: `${weather.windSpeed} km/h`,
                        color: "#10b981",
                      },
                      {
                        icon: <Visibility />,
                        label: "Visibility",
                        value: `${weather.visibility} km`,
                        color: "#f59e0b",
                      },
                      {
                        icon: <WbSunny />,
                        label: "Rain",
                        value: `${weather.precipitation}%`,
                        color: "#ef4444",
                      },
                    ].map((item, index) => (
                      <Grid item xs={6} key={index}>
                        <Box
                          sx={{
                            bgcolor: "white",
                            p: 1.5,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ color: item.color, mr: 1, fontSize: 20 }}>
                            {item.icon}
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.65rem" }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="text.primary"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* ETA Prediction */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 2.5,
                    mb: 2.5,
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: "#dbeafe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1.5,
                      }}
                    >
                      <Timer sx={{ color: "#3b82f6", fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="text.primary"
                      >
                        ETA Accuracy
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        AI vs actual comparison
                      </Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={etaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="time"
                        stroke="#6b7280"
                        style={{ fontSize: 9 }}
                      />
                      <YAxis stroke="#6b7280" style={{ fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 10,
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="AI Predicted"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        name="Actual"
                        dot={{ fill: "#3b82f6", r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Response Breakdown */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                    mb: 2.5,
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: "#fef3c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1.5,
                      }}
                    >
                      <LocalShipping sx={{ color: "#f59e0b", fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="text.primary"
                      >
                        Time Breakdown
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Response phase allocation
                      </Typography>
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={responseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        label={(entry) => `${entry.value}m`}
                        labelLine={false}
                      >
                        {responseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        verticalAlign="bottom"
                        height={24}
                        wrapperStyle={{ fontSize: 10 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LiveTracking;
