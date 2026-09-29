import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  Backdrop,
  LinearProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  Add,
  Search,
  Visibility,
  LocalShipping,
  Close,
  ViewList,
  Map as MapIcon,
  ArrowDownward,
  Warning,
  Info,
  Error as ErrorIcon,
  CheckCircle,
  CloudUpload,
  Delete as DeleteIcon,
  Mic,
  Sms,
  SmsFailedOutlined,
  PhoneAndroid,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";
import { transcriptionAPI, dispatchAPI, ambulanceAPI, getErrorMessage } from "../services/api";
import { notifyEmergencyDispatch } from "../services/notifications";

const ActiveEmergencies = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState("list");
  const [emergencies, setEmergencies] = useState([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newEmergencyModalOpen, setNewEmergencyModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [emergencyMap, setEmergencyMap] = useState(null);
  const [detailMap, setDetailMap] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now()); // For real-time updates

  // New emergency form state
  const [newEmergencyForm, setNewEmergencyForm] = useState({
    type: "Medical Emergency",
    priority: "high",
    description: "",
    location: "",
    patientName: "",
    patientAge: "",
    patientPhone: "",
    victims: 1,
    specialRequirements: [],
    additionalNotes: "",
  });

  // Audio upload state
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcriptionSuccess, setTranscriptionSuccess] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(null);

  // Ambulance selection state
  const [showAmbulanceSelection, setShowAmbulanceSelection] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [availableAmbulances, setAvailableAmbulances] = useState([]);
  const [ambulanceRoutes, setAmbulanceRoutes] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [isCalculatingRoutes, setIsCalculatingRoutes] = useState(false);
  const [routeMap, setRouteMap] = useState(null);
  // SMS notification result — set after ambulance is successfully dispatched
  const [smsDispatchResult, setSmsDispatchResult] = useState(null);

  // Mock data - use useMemo to prevent recreating on every render
  const mockEmergencies = useMemo(() => {
    const now = Date.now();
    return [
      {
        id: "EMG-001",
        type: "Heart Attack",
        description: "Patient experiencing severe chest pain",
        priority: "critical",
        status: "en_route",
        location: {
          address: "Connaught Place, New Delhi",
          latitude: 28.6289,
          longitude: 77.2065,
        },
        timeReported: new Date(now - 1000 * 60 * 15).toISOString(), // 15 min ago from first load
        victims: 1,
        assignedAmbulanceId: "AMB-001",
        timeEstimatedArrival: "5 min",
        specialRequirements: ["Cardiac Care"],
      },
      {
        id: "EMG-002",
        type: "Traffic Accident",
        description: "Multi-vehicle collision on highway",
        priority: "high",
        status: "at_scene",
        location: {
          address: "India Gate, New Delhi",
          latitude: 28.6129,
          longitude: 77.2295,
        },
        timeReported: new Date(now - 1000 * 60 * 45).toISOString(), // 45 min ago
        victims: 3,
        assignedAmbulanceId: "AMB-002",
        specialRequirements: ["Trauma Team", "Multiple Units"],
      },
      {
        id: "EMG-003",
        type: "Respiratory Distress",
        description: "Difficulty breathing, elderly patient",
        priority: "high",
        status: "awaiting_dispatch",
        location: {
          address: "Karol Bagh, New Delhi",
          latitude: 28.6517,
          longitude: 77.1909,
        },
        timeReported: new Date(now - 1000 * 60 * 8).toISOString(), // 8 min ago
        victims: 1,
        specialRequirements: ["Respiratory Support"],
      },
      {
        id: "EMG-004",
        type: "Fall Injury",
        description: "Elderly patient fell at home",
        priority: "medium",
        status: "new",
        location: {
          address: "Dwarka, New Delhi",
          latitude: 28.5921,
          longitude: 77.046,
        },
        timeReported: new Date(now - 1000 * 60 * 5).toISOString(), // 5 min ago
        victims: 1,
        specialRequirements: ["Geriatric Care"],
      },
      {
        id: "EMG-005",
        type: "Minor Injury",
        description: "Cut requiring stitches",
        priority: "low",
        status: "completed",
        location: {
          address: "Nehru Place, New Delhi",
          latitude: 28.5505,
          longitude: 77.2506,
        },
        timeReported: new Date(now - 1000 * 60 * 120).toISOString(), // 2h ago
        victims: 1,
        assignedAmbulanceId: "AMB-003",
      },
      {
        id: "EMG-006",
        type: "Stroke",
        description: "Patient showing signs of stroke, facial drooping",
        priority: "critical",
        status: "new",
        location: {
          address: "Vasant Vihar, New Delhi",
          latitude: 28.5574,
          longitude: 77.1582,
        },
        timeReported: new Date(now - 1000 * 60 * 3).toISOString(), // 3 min ago
        victims: 1,
        specialRequirements: ["Stroke Unit", "Immediate Transfer"],
      },
      {
        id: "EMG-007",
        type: "Fire Accident",
        description: "Burn injuries from kitchen fire",
        priority: "high",
        status: "awaiting_dispatch",
        location: {
          address: "Rohini Sector 18, New Delhi",
          latitude: 28.7418,
          longitude: 77.1172,
        },
        timeReported: new Date(now - 1000 * 60 * 12).toISOString(), // 12 min ago
        victims: 2,
        specialRequirements: ["Burn Care", "Intensive Care"],
      },
      {
        id: "EMG-008",
        type: "Diabetic Emergency",
        description: "Low blood sugar, patient unconscious",
        priority: "high",
        status: "new",
        location: {
          address: "Janakpuri, New Delhi",
          latitude: 28.6219,
          longitude: 77.0855,
        },
        timeReported: new Date(now - 1000 * 60 * 6).toISOString(), // 6 min ago
        victims: 1,
        specialRequirements: ["Glucose Administration"],
      },
      {
        id: "EMG-009",
        type: "Pregnancy Complication",
        description: "Woman in labor, complications reported",
        priority: "critical",
        status: "en_route",
        location: {
          address: "Saket, New Delhi",
          latitude: 28.5244,
          longitude: 77.2066,
        },
        timeReported: new Date(now - 1000 * 60 * 25).toISOString(), // 25 min ago
        victims: 1,
        assignedAmbulanceId: "AMB-004",
        timeEstimatedArrival: "7 min",
        specialRequirements: ["Obstetric Care", "NICU Ready"],
      },
      {
        id: "EMG-010",
        type: "Seizure",
        description: "Patient having continuous seizures",
        priority: "high",
        status: "awaiting_dispatch",
        location: {
          address: "Lajpat Nagar, New Delhi",
          latitude: 28.5678,
          longitude: 77.2431,
        },
        timeReported: new Date(now - 1000 * 60 * 10).toISOString(), // 10 min ago
        victims: 1,
        specialRequirements: ["Neurological Care"],
      },
      {
        id: "EMG-011",
        type: "Allergic Reaction",
        description: "Severe allergic reaction, anaphylaxis suspected",
        priority: "critical",
        status: "new",
        location: {
          address: "Greater Kailash, New Delhi",
          latitude: 28.5494,
          longitude: 77.2426,
        },
        timeReported: new Date(now - 1000 * 60 * 2).toISOString(), // 2 min ago
        victims: 1,
        specialRequirements: ["EpiPen", "Antihistamines"],
      },
      {
        id: "EMG-012",
        type: "Assault",
        description: "Victim of physical assault, multiple injuries",
        priority: "high",
        status: "new",
        location: {
          address: "Tilak Nagar, New Delhi",
          latitude: 28.6414,
          longitude: 77.0952,
        },
        timeReported: new Date(now - 1000 * 60 * 7).toISOString(), // 7 min ago
        victims: 1,
        specialRequirements: ["Trauma Care", "Police Coordination"],
      },
      {
        id: "EMG-013",
        type: "Drowning",
        description: "Child rescued from pool, CPR in progress",
        priority: "critical",
        status: "awaiting_dispatch",
        location: {
          address: "Chanakyapuri, New Delhi",
          latitude: 28.5984,
          longitude: 77.1846,
        },
        timeReported: new Date(now - 1000 * 60 * 4).toISOString(), // 4 min ago
        victims: 1,
        specialRequirements: ["Pediatric Care", "Ventilator"],
      },
      {
        id: "EMG-014",
        type: "Drug Overdose",
        description: "Suspected drug overdose, patient unresponsive",
        priority: "critical",
        status: "new",
        location: {
          address: "Hauz Khas, New Delhi",
          latitude: 28.5494,
          longitude: 77.2001,
        },
        timeReported: new Date(now - 1000 * 60 * 9).toISOString(), // 9 min ago
        victims: 1,
        specialRequirements: ["Toxicology", "Naloxone"],
      },
      {
        id: "EMG-015",
        type: "Animal Bite",
        description: "Dog bite, bleeding profusely",
        priority: "medium",
        status: "completed",
        location: {
          address: "Rajouri Garden, New Delhi",
          latitude: 28.6418,
          longitude: 77.1212,
        },
        timeReported: new Date(now - 1000 * 60 * 90).toISOString(), // 1.5h ago
        victims: 1,
        assignedAmbulanceId: "AMB-005",
        specialRequirements: ["Rabies Vaccine"],
      },
    ];
  }, []); // Empty dependency array means this only runs once

  // Load emergencies from localStorage or use mock data
  useEffect(() => {
    const savedEmergencies = localStorage.getItem("activeEmergencies");
    if (savedEmergencies) {
      const parsed = JSON.parse(savedEmergencies);
      setEmergencies(parsed);
      setFilteredEmergencies(parsed);
    } else {
      setEmergencies(mockEmergencies);
      setFilteredEmergencies(mockEmergencies);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save emergencies to localStorage whenever they change
  useEffect(() => {
    if (emergencies.length > 0) {
      localStorage.setItem("activeEmergencies", JSON.stringify(emergencies));
    }
  }, [emergencies]);

  // Update time every second for live real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Handle navigation back from Track page with new emergency
  useEffect(() => {
    if (location.state?.newEmergency) {
      const { newEmergency, message } = location.state;
      setEmergencies((prev) => [newEmergency, ...prev]);
      if (message) {
        alert(message);
      }
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    let filtered = emergencies;

    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((e) => e.priority === priorityFilter);
    }

    setFilteredEmergencies(filtered);
  }, [searchQuery, statusFilter, priorityFilter, emergencies]);

  useEffect(() => {
    // Cleanup previous map when switching views
    if (view !== "map" && emergencyMap) {
      emergencyMap.remove();
      setEmergencyMap(null);
      return;
    }

    // Initialize map when in map view
    if (view === "map" && window.tt && filteredEmergencies.length > 0) {
      // Small delay to ensure container is rendered
      const timeoutId = setTimeout(() => {
        const container = document.getElementById("emergencies-map-container");
        if (!container || emergencyMap) return;

        try {
          const map = window.tt.map({
            key: process.env.REACT_APP_TOMTOM_API_KEY,
            container: "emergencies-map-container",
            center: [77.209, 28.6139],
            zoom: 11,
            style: "tomtom://vector/1/basic-main",
          });

          map.addControl(new window.tt.NavigationControl());
          map.addControl(new window.tt.FullscreenControl());

          map.on("load", () => {
            filteredEmergencies.forEach((emergency) => {
              const markerColor = getPriorityColor(emergency.priority);
              const markerElement = document.createElement("div");
              markerElement.innerHTML = `<div style="background-color: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">!</div>`;

              const popup = new window.tt.Popup({ offset: 35 }).setHTML(`
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${
                    emergency.type
                  }</h3>
                  <p style="margin: 0 0 5px 0; font-size: 12px;">${
                    emergency.description
                  }</p>
                  <p style="margin: 0; font-size: 11px; color: #666;"><strong>Priority:</strong> ${
                    emergency.priority
                  }</p>
                  <p style="margin: 0; font-size: 11px; color: #666;"><strong>Status:</strong> ${getStatusText(
                    emergency.status
                  )}</p>
                </div>
              `);

              new window.tt.Marker({ element: markerElement })
                .setLngLat([
                  emergency.location.longitude,
                  emergency.location.latitude,
                ])
                .setPopup(popup)
                .addTo(map);
            });
          });

          setEmergencyMap(map);
        } catch (error) {
          console.error("Error initializing TomTom map:", error);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [view, filteredEmergencies, emergencyMap]);

  const handleViewEmergency = (emergency) => {
    setSelectedEmergency(emergency);
    setDetailModalOpen(true);
  };

  // Separate useEffect for detail map initialization
  useEffect(() => {
    if (detailModalOpen && selectedEmergency && window.tt && !detailMap) {
      const timeoutId = setTimeout(() => {
        const container = document.getElementById("detail-map-container");
        if (!container) return;

        try {
          const map = window.tt.map({
            key: process.env.REACT_APP_TOMTOM_API_KEY,
            container: "detail-map-container",
            center: [
              selectedEmergency.location.longitude,
              selectedEmergency.location.latitude,
            ],
            zoom: 14,
            style: "tomtom://vector/1/basic-main",
          });

          map.addControl(new window.tt.NavigationControl());

          const markerElement = document.createElement("div");
          markerElement.innerHTML = `<div style="background-color: ${getPriorityColor(
            selectedEmergency.priority
          )}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">!</div>`;

          new window.tt.Marker({ element: markerElement })
            .setLngLat([
              selectedEmergency.location.longitude,
              selectedEmergency.location.latitude,
            ])
            .addTo(map);

          setDetailMap(map);
        } catch (error) {
          console.error("Error initializing detail map:", error);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [detailModalOpen, selectedEmergency, detailMap]);

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    if (detailMap) {
      detailMap.remove();
      setDetailMap(null);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: "#ef4444",
      high: "#f97316",
      medium: "#eab308",
      low: "#10b981",
    };
    return colors[priority] || "#6b7280";
  };

  const getPriorityChipColor = (priority) => {
    const colors = {
      critical: "error",
      high: "warning",
      medium: "info",
      low: "success",
    };
    return colors[priority] || "default";
  };

  const getStatusChipColor = (status) => {
    const colors = {
      new: "info",
      awaiting_dispatch: "warning",
      en_route: "primary",
      at_scene: "success",
      completed: "default",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusMap = {
      new: "New",
      awaiting_dispatch: "Awaiting Dispatch",
      en_route: "En Route",
      at_scene: "At Scene",
      completed: "Completed",
    };
    return statusMap[status] || status;
  };

  const handleDeleteEmergency = (emergencyId) => {
    if (
      window.confirm("Are you sure you want to delete this emergency report?")
    ) {
      setEmergencies((prev) => prev.filter((e) => e.id !== emergencyId));
    }
  };

  const timeSince = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const seconds = Math.floor((currentTime - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getCounts = () => {
    return {
      critical: emergencies.filter((e) => e.priority === "critical").length,
      high: emergencies.filter((e) => e.priority === "high").length,
      medium: emergencies.filter((e) => e.priority === "medium").length,
      low: emergencies.filter((e) => e.priority === "low").length,
    };
  };

  const counts = getCounts();

  const handleCreateEmergency = () => {
    // Validate form
    if (
      !newEmergencyForm.type ||
      !newEmergencyForm.description ||
      !newEmergencyForm.location
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate age if provided
    if (
      newEmergencyForm.patientAge &&
      (parseInt(newEmergencyForm.patientAge) < 0 ||
        parseInt(newEmergencyForm.patientAge) > 150)
    ) {
      alert("Please enter a valid age");
      return;
    }

    // Create new emergency
    const newEmergency = {
      id: `EMG-${Date.now()}`,
      type: newEmergencyForm.type,
      description: newEmergencyForm.description,
      priority: newEmergencyForm.priority,
      status: "new",
      location: {
        address: newEmergencyForm.location || "Location not specified",
        latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
        longitude: 77.209 + (Math.random() - 0.5) * 0.1,
      },
      timeReported: new Date().toISOString(),
      patientName: newEmergencyForm.patientName || "Unknown",
      patientAge: newEmergencyForm.patientAge || null,
      victims: parseInt(newEmergencyForm.victims) || 1,
      specialRequirements: newEmergencyForm.specialRequirements,
      additionalNotes: newEmergencyForm.additionalNotes,
    };

    // Add to emergencies list
    setEmergencies([newEmergency, ...emergencies]);

    // Reset form
    setNewEmergencyForm({
      type: "Medical Emergency",
      priority: "high",
      description: "",
      location: "",
      patientName: "",
      patientAge: "",
      patientPhone: "",
      victims: 1,
      specialRequirements: [],
      additionalNotes: "",
    });

    setAudioFile(null);
    setTranscriptionSuccess(false);
    setTranscriptionError(null);
    setNewEmergencyModalOpen(false);
    alert("Emergency created successfully!");
  };

  const handleFormChange = (field, value) => {
    setNewEmergencyForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAudioUpload = async () => {
    if (!audioFile) {
      setTranscriptionError("Please select an audio file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setTranscriptionError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Upload and transcribe
      const result = await transcriptionAPI.uploadAndTranscribe(audioFile);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setTranscriptionSuccess(true);

      // Auto-fill form with extracted data
      if (result && result.extracted_data) {
        const data = result.extracted_data;

        setNewEmergencyForm((prev) => ({
          ...prev,
          type: data.emergency_type || prev.type,
          priority: data.severity ? data.severity.toLowerCase() : prev.priority,
          description: Array.isArray(data.symptoms)
            ? data.symptoms.join(", ")
            : data.symptoms || prev.description,
          location: data.location || prev.location,
          patientName: data.patient_name || prev.patientName,
          patientAge: data.patient_age
            ? String(data.patient_age)
            : prev.patientAge,
          patientPhone: data.patient_phone || prev.patientPhone,
          specialRequirements: Array.isArray(data.special_requirements)
            ? data.special_requirements
            : prev.specialRequirements,
          additionalNotes: [
            data.consciousness ? `Consciousness: ${data.consciousness}` : "",
            data.breathing ? `Breathing: ${data.breathing}` : "",
            data.caller_name ? `Caller: ${data.caller_name}` : "",
            data.caller_phone ? `Phone: ${data.caller_phone}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }));
      }
    } catch (err) {
      setTranscriptionError(getErrorMessage(err, "Failed to process audio file"));
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle ambulance selection workflow
  const handlePickAmbulance = () => {
    if (!newEmergencyForm.description) {
      alert(
        "Please fill in at least the description before picking an ambulance"
      );
      return;
    }

    if (!newEmergencyForm.location) {
      const proceed = window.confirm(
        "Location is not specified. Do you want to continue anyway?"
      );
      if (!proceed) return;
    }

    // Navigate to Track page with emergency data
    navigate("/track", {
      state: {
        emergencyData: newEmergencyForm,
      },
    });
  };

  const handleCalculateRoutes = async () => {
    setIsCalculatingRoutes(true);

    // Mock ambulances with locations
    const mockAmbulances = [
      {
        id: "AMB-001",
        location: { lat: 28.6139, lng: 77.209 },
        status: "available",
        crew: 3,
      },
      {
        id: "AMB-002",
        location: { lat: 28.6189, lng: 77.215 },
        status: "available",
        crew: 3,
      },
      {
        id: "AMB-003",
        location: { lat: 28.6089, lng: 77.2 },
        status: "available",
        crew: 2,
      },
      {
        id: "AMB-004",
        location: { lat: 28.6239, lng: 77.22 },
        status: "available",
        crew: 4,
      },
      {
        id: "AMB-005",
        location: { lat: 28.6039, lng: 77.195 },
        status: "available",
        crew: 3,
      },
    ];

    setAvailableAmbulances(mockAmbulances);

    // Simulate patient location (in real app, would geocode the address)
    const patientLocation = { lat: 28.62, lng: 77.21 };

    // Calculate routes for each ambulance
    const routes = [];
    const colors = ["#ef4444", "#f97316", "#eab308", "#10b981", "#3b82f6"];

    for (let i = 0; i < mockAmbulances.length; i++) {
      const ambulance = mockAmbulances[i];
      // Simulate distance and ETA calculation
      const distance =
        Math.sqrt(
          Math.pow(ambulance.location.lat - patientLocation.lat, 2) +
            Math.pow(ambulance.location.lng - patientLocation.lng, 2)
        ) * 100; // Rough distance in km

      const eta = Math.ceil(distance * 2); // Minutes

      routes.push({
        ambulanceId: ambulance.id,
        distance: distance.toFixed(2),
        eta: eta,
        color: colors[i],
        path: [
          [ambulance.location.lng, ambulance.location.lat],
          [patientLocation.lng, patientLocation.lat],
        ],
        crew: ambulance.crew,
      });
    }

    // Sort by ETA
    routes.sort((a, b) => a.eta - b.eta);
    setAmbulanceRoutes(routes);

    // Use LLM to select best ambulance (simulate with simple logic + best ETA)
    const bestRoute = routes[0]; // Shortest ETA
    setSelectedAmbulance(bestRoute);

    // Draw routes on map
    setTimeout(() => {
      drawRoutesOnMap(routes, patientLocation);
      setIsCalculatingRoutes(false);
    }, 1000);
  };

  const drawRoutesOnMap = (routes, patientLocation) => {
    const mapContainer = document.getElementById(
      "ambulance-route-map-container"
    );
    if (!mapContainer || !window.tt) return;

    // Clear existing map
    if (routeMap) {
      routeMap.remove();
    }

    const map = window.tt.map({
      key: process.env.REACT_APP_TOMTOM_API_KEY,
      container: "ambulance-route-map-container",
      center: [patientLocation.lng, patientLocation.lat],
      zoom: 12,
    });

    setRouteMap(map);

    // Add patient marker
    const patientMarker = document.createElement("div");
    patientMarker.style.cssText = `
      width: 32px;
      height: 32px;
      background-color: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      animation: pulse 2s infinite;
    `;
    patientMarker.textContent = "🚨";

    new window.tt.Marker({ element: patientMarker })
      .setLngLat([patientLocation.lng, patientLocation.lat])
      .addTo(map);

    // Draw routes and add ambulance markers
    routes.forEach((route, index) => {
      // Add route line
      map.on("load", () => {
        map.addLayer({
          id: `route-${route.ambulanceId}`,
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: route.path,
              },
            },
          },
          paint: {
            "line-color": route.color,
            "line-width":
              route.ambulanceId === selectedAmbulance?.ambulanceId ? 5 : 3,
            "line-opacity": 0.8,
          },
        });
      });

      // Add ambulance marker
      const ambulanceMarker = document.createElement("div");
      ambulanceMarker.style.cssText = `
        width: 28px;
        height: 28px;
        background-color: ${route.color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
      `;
      ambulanceMarker.textContent = "🚑";

      const marker = new window.tt.Marker({ element: ambulanceMarker })
        .setLngLat(route.path[0])
        .addTo(map);

      const popup = new window.tt.Popup({ offset: 35 }).setHTML(
        `<div style="padding: 8px;">
          <strong>${route.ambulanceId}</strong><br/>
          ETA: ${route.eta} min<br/>
          Distance: ${route.distance} km<br/>
          Crew: ${route.crew}
        </div>`
      );
      marker.setPopup(popup);
    });
  };

  const handleConfirmAmbulance = async () => {
    if (!selectedAmbulance) {
      alert("No ambulance selected");
      return;
    }

    try {
      // Fetch ambulance details to get driver phone number
      const ambulances = await ambulanceAPI.getAllAmbulances();
      const ambulance = ambulances.find(
        (amb) => amb.id === selectedAmbulance.ambulanceId // Backend uses "id" field
      );

      if (!ambulance) {
        alert(`Ambulance ${selectedAmbulance.ambulanceId} not found in system`);
        return;
      }

      // Prepare dispatch data with WhatsApp notification
      const dispatchData = {
        ambulance_id: selectedAmbulance.ambulanceId,
        hospital_name: "AIIMS New Delhi", // Default hospital - you can make this dynamic later
        hospital_address: "Ansari Nagar, New Delhi, Delhi 110029",
        driver_phone: ambulance.driver.phone,
        driver_name: ambulance.driver.name,
        patient_info: `${newEmergencyForm.patientName || "Unknown Patient"} - ${
          newEmergencyForm.description
        }`,
        eta: selectedAmbulance.eta,
      };

      // Call dispatch API - this will send WhatsApp + SMS messages automatically
      const dispatchResponse = await dispatchAPI.createDispatch(dispatchData);

      // Capture SMS result for the notification panel
      const smsStatus = dispatchResponse.sms_status || {};
      setSmsDispatchResult({
        ambulanceId: selectedAmbulance.ambulanceId,
        driverName: ambulance.driver.name,
        driverPhone: ambulance.driver.phone,
        status: smsStatus.status || "pending",
        sent: smsStatus.sent === true,
        mock: smsStatus.mock === true,
        sentAt: smsStatus.sent_at || null,
        messageId: smsStatus.message_id || null,
        error: smsStatus.error || null,
      });

      // Create emergency with assigned ambulance
      const newEmergency = {
        id: `EMG-${Date.now()}`,
        type: newEmergencyForm.type,
        description: newEmergencyForm.description,
        priority: newEmergencyForm.priority,
        status: "dispatched",
        location: {
          address: newEmergencyForm.location || "Location not specified",
          latitude: 28.62,
          longitude: 77.21,
        },
        timeReported: new Date().toISOString(),
        patientName: newEmergencyForm.patientName || "Unknown",
        patientAge: newEmergencyForm.patientAge || null,
        victims: parseInt(newEmergencyForm.victims) || 1,
        specialRequirements: newEmergencyForm.specialRequirements,
        additionalNotes: newEmergencyForm.additionalNotes,
        assignedAmbulanceId: selectedAmbulance.ambulanceId,
        timeEstimatedArrival: `${selectedAmbulance.eta} min`,
        dispatchId: dispatchResponse.dispatch_id,
      };

      setEmergencies([newEmergency, ...emergencies]);

      // Reset all states
      setNewEmergencyForm({
        type: "Medical Emergency",
        priority: "high",
        description: "",
        location: "",
        patientName: "",
        patientAge: "",
        patientPhone: "",
        victims: 1,
        specialRequirements: [],
        additionalNotes: "",
      });

      setAudioFile(null);
      setTranscriptionSuccess(false);
      setTranscriptionError(null);
      setShowAmbulanceSelection(false);
      setSelectedAmbulance(null);
      setAmbulanceRoutes([]);
      setNewEmergencyModalOpen(false);

      if (routeMap) {
        routeMap.remove();
        setRouteMap(null);
      }

      // Show an emergency-style alert with the assignment notification details
      const whatsappStatus = dispatchResponse.whatsapp_status;
      notifyEmergencyDispatch({
        ambulanceId: selectedAmbulance.ambulanceId,
        eta: selectedAmbulance.eta,
        driverName: ambulance.driver.name,
        driverPhone: ambulance.driver.phone,
        sent: whatsappStatus.sent,
        error: whatsappStatus.error,
      });
    } catch (error) {
      console.error("Error dispatching ambulance:", error);
      alert(
        `Failed to dispatch ambulance: ${getErrorMessage(
          error,
          "Failed to dispatch ambulance"
        )}`
      );
    }
  };

  // Initialize route map when ambulance selection is shown
  useEffect(() => {
    if (showAmbulanceSelection && ambulanceRoutes.length === 0) {
      handleCalculateRoutes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAmbulanceSelection]);

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
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Active Emergencies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and manage all emergency incidents
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<Add />}
            onClick={() => {
              setSmsDispatchResult(null);
              setNewEmergencyModalOpen(true);
            }}
          >
            New Emergency
          </Button>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb" }}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <ErrorIcon sx={{ color: "#ef4444" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#ef4444">
                    {counts.critical}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Critical
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb" }}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#ffedd5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Warning sx={{ color: "#f97316" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#f97316">
                    {counts.high}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    High
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb" }}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Info sx={{ color: "#eab308" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#eab308">
                    {counts.medium}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Medium
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb" }}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#d1fae5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <CheckCircle sx={{ color: "#10b981" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#10b981">
                    {counts.low}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Low
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ── SMS Notification Status Panel ──────────────────────────────────
             Shown after a successful ambulance dispatch from this page.
             Dismissed when the user closes it or opens a new emergency form. */}
        {smsDispatchResult && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              border: "1px solid",
              borderColor: smsDispatchResult.status === "failed" ? "#fca5a5" : "#bbf7d0",
              borderRadius: 2,
              bgcolor: smsDispatchResult.status === "failed" ? "#fef2f2" : "#f0fdf4",
              position: "relative",
            }}
          >
            {/* Dismiss button */}
            <IconButton
              size="small"
              onClick={() => setSmsDispatchResult(null)}
              sx={{ position: "absolute", top: 8, right: 8 }}
              aria-label="Dismiss SMS status"
            >
              <Close fontSize="small" />
            </IconButton>

            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              {smsDispatchResult.status === "failed" ? (
                <SmsFailedOutlined sx={{ color: "#ef4444", fontSize: 22 }} />
              ) : (
                <Sms sx={{ color: "#16a34a", fontSize: 22 }} />
              )}
              <Typography variant="subtitle1" fontWeight={700}>
                Driver SMS Notification
              </Typography>
              <Chip
                label={
                  smsDispatchResult.status === "sent"
                    ? "Sent"
                    : smsDispatchResult.status === "mock"
                    ? "Test Mode"
                    : smsDispatchResult.status === "failed"
                    ? "Failed"
                    : "Pending"
                }
                size="small"
                sx={{
                  ml: 1,
                  fontWeight: 700,
                  bgcolor:
                    smsDispatchResult.status === "failed"
                      ? "#fee2e2"
                      : smsDispatchResult.status === "mock"
                      ? "#fef9c3"
                      : "#dcfce7",
                  color:
                    smsDispatchResult.status === "failed"
                      ? "#dc2626"
                      : smsDispatchResult.status === "mock"
                      ? "#92400e"
                      : "#16a34a",
                }}
              />
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            {/* Info grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                gap: 1,
              }}
            >
              <Box display="flex" alignItems="center" gap={0.75}>
                <PhoneAndroid sx={{ fontSize: 15, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">Driver:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {smsDispatchResult.driverName || "—"}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.75}>
                <LocalShipping sx={{ fontSize: 15, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">Ambulance:</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {smsDispatchResult.ambulanceId}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.75}>
                <Sms sx={{ fontSize: 15, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">Phone:</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace" }}>
                  {smsDispatchResult.driverPhone
                    ? smsDispatchResult.driverPhone.replace(
                        /^(\+\d{2})(\d+)(\d{4})$/,
                        (_, cc, mid, last) => `${cc}${"*".repeat(mid.length)}${last}`
                      )
                    : "—"}
                </Typography>
              </Box>

              {smsDispatchResult.sentAt && (
                <Box display="flex" alignItems="center" gap={0.75}>
                  <CheckCircle sx={{ fontSize: 15, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">Sent At:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(smsDispatchResult.sentAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </Box>

            {smsDispatchResult.status === "failed" && smsDispatchResult.error && (
              <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
                <Typography variant="caption">
                  SMS Error: {smsDispatchResult.error}
                </Typography>
              </Alert>
            )}

            {smsDispatchResult.mock && smsDispatchResult.status !== "failed" && (
              <Alert severity="info" sx={{ mt: 1.5, py: 0.5 }}>
                <Typography variant="caption">
                  SMS_TEST_MODE is enabled — no real message was sent to the driver.
                  Set <code>SMS_TEST_MODE=false</code> and configure Twilio credentials
                  in <code>backend/.env</code> to enable real SMS delivery.
                </Typography>
              </Alert>
            )}
          </Paper>
        )}

        {/* Filters and View Switcher */}
        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight={500}>
                View:
              </Typography>
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(e, newView) => newView && setView(newView)}
                size="small"
              >
                <ToggleButton value="list">
                  <ViewList sx={{ mr: 0.5, fontSize: 18 }} /> List
                </ToggleButton>
                <ToggleButton value="map">
                  <MapIcon sx={{ mr: 0.5, fontSize: 18 }} /> Map
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap">
              <TextField
                size="small"
                placeholder="Search emergencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="awaiting_dispatch">
                    Awaiting Dispatch
                  </MenuItem>
                  <MenuItem value="en_route">En Route</MenuItem>
                  <MenuItem value="at_scene">At Scene</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="all">All Priority</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>

        {/* List View */}
        {view === "list" && (
          <Paper
            elevation={0}
            sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}
          >
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f9fafb" }}>
                  <TableRow>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        ID <ArrowDownward sx={{ fontSize: 16, ml: 0.5 }} />
                      </Box>
                    </TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Reported</TableCell>
                    <TableCell>Assigned Unit</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmergencies.map((emergency) => (
                    <TableRow
                      key={emergency.id}
                      hover
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {emergency.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {emergency.type}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", maxWidth: 200 }}
                        >
                          {emergency.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={emergency.priority.toUpperCase()}
                          size="small"
                          color={getPriorityChipColor(emergency.priority)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(emergency.status)}
                          size="small"
                          color={getStatusChipColor(emergency.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {emergency.location.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(
                            emergency.timeReported
                          ).toLocaleTimeString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {timeSince(emergency.timeReported)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {emergency.assignedAmbulanceId ? (
                          <Typography variant="body2">
                            {emergency.assignedAmbulanceId}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewEmergency(emergency)}
                            title="View Details"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          {emergency.assignedAmbulanceId &&
                            emergency.status !== "completed" && (
                              <IconButton
                                size="small"
                                sx={{
                                  bgcolor: "#3b82f6",
                                  color: "white",
                                  "&:hover": { bgcolor: "#2563eb" },
                                }}
                                onClick={() =>
                                  navigate("/live-tracking", {
                                    state: { emergency },
                                  })
                                }
                                title="Track on Map"
                              >
                                <MapIcon fontSize="small" />
                              </IconButton>
                            )}
                          {!emergency.assignedAmbulanceId && (
                            <IconButton
                              size="small"
                              color="error"
                              title="No Ambulance Assigned"
                            >
                              <LocalShipping fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteEmergency(emergency.id)}
                            title="Delete Emergency"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {filteredEmergencies.length} of {emergencies.length}{" "}
                emergencies
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Map View */}
        {view === "map" && (
          <Paper
            elevation={0}
            sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}
          >
            <Box
              id="emergencies-map-container"
              sx={{ width: "100%", height: "70vh", bgcolor: "#f5f5f5" }}
            />
          </Paper>
        )}

        {/* Emergency Detail Modal */}
        <Modal
          open={detailModalOpen}
          onClose={handleCloseDetailModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={detailModalOpen}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: 600 },
                maxHeight: "90vh",
                overflow: "auto",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
              }}
            >
              {selectedEmergency && (
                <>
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Emergency Detail
                    </Typography>
                    <IconButton size="small" onClick={handleCloseDetailModal}>
                      <Close />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={2}
                    >
                      <Box>
                        <Typography variant="h5" fontWeight={600}>
                          {selectedEmergency.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {selectedEmergency.id}
                        </Typography>
                      </Box>
                      <Chip
                        label={selectedEmergency.priority.toUpperCase()}
                        color={getPriorityChipColor(selectedEmergency.priority)}
                      />
                    </Box>

                    <Typography variant="body1" color="text.secondary" mb={3}>
                      {selectedEmergency.description}
                    </Typography>

                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          STATUS
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {getStatusText(selectedEmergency.status)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          LOCATION
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEmergency.location.address}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          REPORTED
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(
                            selectedEmergency.timeReported
                          ).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {timeSince(selectedEmergency.timeReported)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          VICTIMS
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEmergency.victims}{" "}
                          {selectedEmergency.victims === 1
                            ? "person"
                            : "people"}
                        </Typography>
                      </Grid>
                    </Grid>

                    {selectedEmergency.specialRequirements &&
                      selectedEmergency.specialRequirements.length > 0 && (
                        <Box mb={3}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            gutterBottom
                          >
                            SPECIAL REQUIREMENTS
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                            {selectedEmergency.specialRequirements.map(
                              (req, index) => (
                                <Chip
                                  key={index}
                                  label={req}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )
                            )}
                          </Box>
                        </Box>
                      )}

                    {selectedEmergency.assignedAmbulanceId ? (
                      <Box mb={3}>
                        <Typography variant="caption" color="text.secondary">
                          ASSIGNED AMBULANCE
                        </Typography>
                        <Card sx={{ mt: 1, bgcolor: "#eff6ff" }}>
                          <CardContent>
                            <Box display="flex" alignItems="center">
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  bgcolor: "#3b82f6",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  mr: 2,
                                }}
                              >
                                <LocalShipping sx={{ color: "white" }} />
                              </Box>
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {selectedEmergency.assignedAmbulanceId}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ETA:{" "}
                                  {selectedEmergency.timeEstimatedArrival ||
                                    "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    ) : (
                      <Box
                        mb={3}
                        sx={{
                          p: 2,
                          bgcolor: "#fef3c7",
                          border: "1px solid #fde047",
                          borderRadius: 1,
                        }}
                      >
                        <Box display="flex">
                          <Warning sx={{ color: "#eab308", mr: 1 }} />
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="#92400e"
                            >
                              No ambulance assigned
                            </Typography>
                            <Typography variant="caption" color="#92400e">
                              This emergency is awaiting dispatch.
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    <Box
                      id="detail-map-container"
                      sx={{
                        width: "100%",
                        height: 200,
                        borderRadius: 1,
                        overflow: "hidden",
                        bgcolor: "#f5f5f5",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderTop: "1px solid #e5e7eb",
                      bgcolor: "#f9fafb",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Button variant="outlined" onClick={handleCloseDetailModal}>
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<LocalShipping />}
                    >
                      Dispatch
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        </Modal>

        {/* New Emergency Modal */}
        <Modal
          open={newEmergencyModalOpen}
          onClose={() => setNewEmergencyModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={newEmergencyModalOpen}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "95%", sm: "85%", md: 900, lg: 1000 },
                maxHeight: "90vh",
                overflow: "auto",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Report New Emergency
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setNewEmergencyModalOpen(false)}
                >
                  <Close />
                </IconButton>
              </Box>
              <Box sx={{ p: 3 }}>
                {/* Audio Upload Section */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    border: "2px dashed #cbd5e0",
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                    textAlign: "center",
                  }}
                >
                  <Mic sx={{ fontSize: 48, color: "#3b82f6", mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Upload Emergency Call Recording
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Upload an MP3 file and we'll automatically extract emergency
                    details using AI
                  </Typography>

                  {!audioFile ? (
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                    >
                      Select Audio File
                      <input
                        type="file"
                        hidden
                        accept="audio/*,.mp3,.mpeg,.wav,.m4a,.webm,.ogg,.flac"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const validExtensions = /\.(mp3|mpeg|wav|m4a|webm|ogg|flac)$/i;
                            if (!file.type.startsWith('audio/') && !validExtensions.test(file.name)) {
                              setTranscriptionError('Please select a valid audio file (MP3, MPEG, WAV, M4A, WebM, OGG, FLAC)');
                              return;
                            }
                            setAudioFile(file);
                            setTranscriptionError(null);
                          }
                        }}
                      />
                    </Button>
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Mic sx={{ color: "#3b82f6" }} />
                        <Typography variant="body2">
                          {audioFile.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setAudioFile(null);
                            setTranscriptionSuccess(false);
                            setTranscriptionError(null);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {isUploading && (
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={uploadProgress}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Processing... {uploadProgress}%
                          </Typography>
                        </Box>
                      )}

                      {transcriptionSuccess && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Audio processed successfully! Form fields have been
                          auto-filled.
                        </Alert>
                      )}

                      {transcriptionError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {transcriptionError}
                        </Alert>
                      )}

                      {!transcriptionSuccess && !isUploading && (
                        <Button
                          variant="contained"
                          onClick={handleAudioUpload}
                          disabled={isUploading}
                        >
                          Process Audio
                        </Button>
                      )}
                    </Box>
                  )}
                </Paper>

                {/* Form Fields */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Emergency Type</InputLabel>
                      <Select
                        label="Emergency Type"
                        value={newEmergencyForm.type}
                        onChange={(e) =>
                          handleFormChange("type", e.target.value)
                        }
                      >
                        <MenuItem value="Medical Emergency">
                          Medical Emergency
                        </MenuItem>
                        <MenuItem value="Heart Attack">Heart Attack</MenuItem>
                        <MenuItem value="Cardiac Emergency">
                          Cardiac Emergency
                        </MenuItem>
                        <MenuItem value="Traffic Accident">
                          Traffic Accident
                        </MenuItem>
                        <MenuItem value="Severe Car Accident">
                          Severe Car Accident
                        </MenuItem>
                        <MenuItem value="Fire">Fire</MenuItem>
                        <MenuItem value="Fall Injury">Fall Injury</MenuItem>
                        <MenuItem value="Respiratory Distress">
                          Respiratory Distress
                        </MenuItem>
                        <MenuItem value="Respiratory Failure">
                          Respiratory Failure
                        </MenuItem>
                        <MenuItem value="Breathing Difficulty">
                          Breathing Difficulty
                        </MenuItem>
                        <MenuItem value="Stroke">Stroke</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        label="Priority"
                        value={newEmergencyForm.priority}
                        onChange={(e) =>
                          handleFormChange("priority", e.target.value)
                        }
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Patient Name"
                      value={newEmergencyForm.patientName}
                      onChange={(e) =>
                        handleFormChange("patientName", e.target.value)
                      }
                      placeholder="Enter patient name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Patient Age"
                      type="number"
                      value={newEmergencyForm.patientAge}
                      onChange={(e) =>
                        handleFormChange("patientAge", e.target.value)
                      }
                      placeholder="Enter patient age"
                      inputProps={{ min: 0, max: 150 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Patient Phone"
                      value={newEmergencyForm.patientPhone}
                      onChange={(e) =>
                        handleFormChange("patientPhone", e.target.value)
                      }
                      placeholder="Enter patient phone number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      label="Description"
                      placeholder="Describe the emergency situation..."
                      value={newEmergencyForm.description}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Location"
                      placeholder="Address or coordinates"
                      value={newEmergencyForm.location}
                      onChange={(e) =>
                        handleFormChange("location", e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Number of Victims"
                      value={newEmergencyForm.victims}
                      onChange={(e) =>
                        handleFormChange("victims", e.target.value)
                      }
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={{ width: "100%" }}>
                      <InputLabel>Special Requirements</InputLabel>
                      <Select
                        label="Special Requirements"
                        multiple
                        value={newEmergencyForm.specialRequirements}
                        onChange={(e) =>
                          handleFormChange(
                            "specialRequirements",
                            e.target.value
                          )
                        }
                        sx={{ width: "100%" }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        }}
                      >
                        <MenuItem value="Cardiac Care">Cardiac Care</MenuItem>
                        <MenuItem value="Defibrillator">Defibrillator</MenuItem>
                        <MenuItem value="Oxygen Support">
                          Oxygen Support
                        </MenuItem>
                        <MenuItem value="Respiratory Support">
                          Respiratory Support
                        </MenuItem>
                        <MenuItem value="Respiratory Care">
                          Respiratory Care
                        </MenuItem>
                        <MenuItem value="Trauma Team">Trauma Team</MenuItem>
                        <MenuItem value="Trauma Care">Trauma Care</MenuItem>
                        <MenuItem value="Stroke Protocol">
                          Stroke Protocol
                        </MenuItem>
                        <MenuItem value="Critical Care">Critical Care</MenuItem>
                        <MenuItem value="Multiple Units">
                          Multiple Units
                        </MenuItem>
                        <MenuItem value="Basic Life Support">
                          Basic Life Support
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      label="Additional Notes"
                      placeholder="Any additional information..."
                      value={newEmergencyForm.additionalNotes}
                      onChange={(e) =>
                        handleFormChange("additionalNotes", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid #e5e7eb",
                  bgcolor: "#f9fafb",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setNewEmergencyModalOpen(false);
                    setShowAmbulanceSelection(false);
                    setAmbulanceRoutes([]);
                    setSelectedAmbulance(null);
                  }}
                >
                  Cancel
                </Button>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {!showAmbulanceSelection ? (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<LocalShipping />}
                        onClick={handlePickAmbulance}
                        disabled={
                          !newEmergencyForm.location ||
                          !newEmergencyForm.description
                        }
                      >
                        Pick Ambulance
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleCreateEmergency}
                        disabled={
                          !newEmergencyForm.location ||
                          !newEmergencyForm.description
                        }
                      >
                        Create Without Dispatch
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleConfirmAmbulance}
                      disabled={!selectedAmbulance}
                    >
                      Confirm & Dispatch {selectedAmbulance?.ambulanceId || ""}
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Ambulance Selection View */}
              {showAmbulanceSelection && (
                <Box
                  sx={{
                    borderTop: "2px solid #e5e7eb",
                    p: 3,
                    bgcolor: "#f9fafb",
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Ambulance Route Calculation
                  </Typography>

                  {isCalculatingRoutes ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <LinearProgress sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Calculating optimal routes from all available
                        ambulances...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Map with Routes */}
                      <Paper
                        elevation={0}
                        sx={{
                          mb: 3,
                          border: "1px solid #e5e7eb",
                          overflow: "hidden",
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          id="ambulance-route-map-container"
                          sx={{
                            width: "100%",
                            height: 400,
                            bgcolor: "#e5e7eb",
                          }}
                        />
                      </Paper>

                      {/* Route Details */}
                      {ambulanceRoutes.length > 0 && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            gutterBottom
                          >
                            Available Ambulances (Sorted by ETA)
                          </Typography>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            AI Recommendation:{" "}
                            <strong>{selectedAmbulance?.ambulanceId}</strong>{" "}
                            has the shortest ETA of{" "}
                            <strong>{selectedAmbulance?.eta} minutes</strong>{" "}
                            and is best suited for this emergency.
                          </Alert>
                          <Grid container spacing={2}>
                            {ambulanceRoutes.map((route, index) => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                key={route.ambulanceId}
                              >
                                <Card
                                  sx={{
                                    cursor: "pointer",
                                    border:
                                      selectedAmbulance?.ambulanceId ===
                                      route.ambulanceId
                                        ? `3px solid ${route.color}`
                                        : "1px solid #e5e7eb",
                                    bgcolor:
                                      selectedAmbulance?.ambulanceId ===
                                      route.ambulanceId
                                        ? "#f0fdf4"
                                        : "white",
                                  }}
                                  onClick={() => setSelectedAmbulance(route)}
                                >
                                  <CardContent>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      mb={1}
                                    >
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: "50%",
                                          bgcolor: route.color,
                                          mr: 1,
                                        }}
                                      />
                                      <Typography variant="h6" fontWeight={600}>
                                        {route.ambulanceId}
                                      </Typography>
                                      {index === 0 && (
                                        <Chip
                                          label="Best"
                                          size="small"
                                          color="success"
                                          sx={{ ml: "auto" }}
                                        />
                                      )}
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      ETA: <strong>{route.eta} min</strong>
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Distance: {route.distance} km
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Crew: {route.crew} members
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Box>
  );
};

export default ActiveEmergencies;
