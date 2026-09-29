import React, { useState, useEffect } from "react";
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
  Avatar,
  Fade,
  Backdrop,
} from "@mui/material";
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Close,
  DirectionsCar,
  LocalHospital,
  CheckCircle,
  Build,
  LocationOn,
  Phone,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";

const Ambulances = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ambulances, setAmbulances] = useState([]);
  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newAmbulanceModalOpen, setNewAmbulanceModalOpen] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [ambulanceMap, setAmbulanceMap] = useState(null);

  // Mock data
  const mockAmbulances = [
    {
      id: "AMB-001",
      vehicleNumber: "DL-01-AB-1234",
      type: "Advanced Life Support",
      status: "available",
      location: {
        address: "AIIMS Hospital, New Delhi",
        latitude: 28.5672,
        longitude: 77.21,
      },
      driver: { name: "Rajesh Kumar", phone: "+91-9876543210" },
      crew: [
        { name: "Dr. Amit Sharma", role: "Paramedic" },
        { name: "Nurse Priya Singh", role: "Nurse" },
      ],
      equipment: [
        "Defibrillator",
        "Oxygen",
        "Stretcher",
        "First Aid Kit",
        "ECG Monitor",
      ],
      lastMaintenance: "2025-10-15",
      nextMaintenance: "2025-12-15",
      totalTrips: 145,
      currentEmergency: null,
    },
    {
      id: "AMB-002",
      vehicleNumber: "DL-01-CD-5678",
      type: "Basic Life Support",
      status: "en_route",
      location: {
        address: "India Gate Area, New Delhi",
        latitude: 28.6129,
        longitude: 77.2295,
      },
      driver: { name: "Suresh Yadav", phone: "+91-9876543211" },
      crew: [{ name: "Paramedic Rahul Verma", role: "Paramedic" }],
      equipment: [
        "Oxygen",
        "Stretcher",
        "First Aid Kit",
        "Blood Pressure Monitor",
      ],
      lastMaintenance: "2025-09-20",
      nextMaintenance: "2025-11-20",
      totalTrips: 98,
      currentEmergency: "EMG-002",
      eta: "8 min",
    },
    {
      id: "AMB-003",
      vehicleNumber: "DL-01-EF-9012",
      type: "Advanced Life Support",
      status: "at_scene",
      location: {
        address: "Connaught Place, New Delhi",
        latitude: 28.6289,
        longitude: 77.2065,
      },
      driver: { name: "Vikram Singh", phone: "+91-9876543212" },
      crew: [
        { name: "Dr. Neha Gupta", role: "Doctor" },
        { name: "Nurse Anjali Mehta", role: "Nurse" },
      ],
      equipment: [
        "Defibrillator",
        "Oxygen",
        "Stretcher",
        "Ventilator",
        "Cardiac Monitor",
      ],
      lastMaintenance: "2025-11-01",
      nextMaintenance: "2026-01-01",
      totalTrips: 203,
      currentEmergency: "EMG-001",
    },
    {
      id: "AMB-004",
      vehicleNumber: "DL-01-GH-3456",
      type: "Patient Transport",
      status: "available",
      location: {
        address: "Safdarjung Hospital, New Delhi",
        latitude: 28.5676,
        longitude: 77.2063,
      },
      driver: { name: "Manoj Tiwari", phone: "+91-9876543213" },
      crew: [{ name: "Attendant Ramesh Kumar", role: "Attendant" }],
      equipment: ["Wheelchair", "Stretcher", "First Aid Kit"],
      lastMaintenance: "2025-10-25",
      nextMaintenance: "2025-12-25",
      totalTrips: 67,
      currentEmergency: null,
    },
    {
      id: "AMB-005",
      vehicleNumber: "DL-01-IJ-7890",
      type: "Advanced Life Support",
      status: "maintenance",
      location: {
        address: "Central Workshop, New Delhi",
        latitude: 28.6517,
        longitude: 77.2334,
      },
      driver: { name: "Deepak Sharma", phone: "+91-9876543214" },
      crew: [],
      equipment: [
        "Defibrillator",
        "Oxygen",
        "Stretcher",
        "ECG Monitor",
        "Suction Device",
      ],
      lastMaintenance: "2025-11-15",
      nextMaintenance: "2025-11-18",
      totalTrips: 178,
      currentEmergency: null,
    },
    {
      id: "AMB-006",
      vehicleNumber: "DL-01-KL-2345",
      type: "Basic Life Support",
      status: "out_of_service",
      location: {
        address: "Repair Center, Dwarka",
        latitude: 28.5921,
        longitude: 77.046,
      },
      driver: { name: "Anil Kumar", phone: "+91-9876543215" },
      crew: [],
      equipment: ["Oxygen", "Stretcher", "First Aid Kit"],
      lastMaintenance: "2025-08-10",
      nextMaintenance: "2025-11-20",
      totalTrips: 89,
      currentEmergency: null,
    },
  ];

  useEffect(() => {
    setAmbulances(mockAmbulances);
    setFilteredAmbulances(mockAmbulances);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = ambulances;

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.driver.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    setFilteredAmbulances(filtered);
  }, [searchQuery, statusFilter, typeFilter, ambulances]);

  useEffect(() => {
    if (window.tt && filteredAmbulances.length > 0 && !ambulanceMap) {
      const timeoutId = setTimeout(() => {
        const container = document.getElementById("ambulance-fleet-map");
        if (!container) {
          console.error("Map container not found!");
          return;
        }

        console.log(
          "Initializing ambulance map with",
          filteredAmbulances.length,
          "ambulances"
        );

        try {
          const map = window.tt.map({
            key: "JXPnqva3lZanMKstFTttkppZnHor4IXr",
            container: "ambulance-fleet-map",
            center: [77.209, 28.6139],
            zoom: 11,
            style:
              "https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&poi=poi_main",
          });

          map.addControl(new window.tt.NavigationControl());
          map.addControl(new window.tt.FullscreenControl());

          map.on("load", () => {
            console.log(
              "Map loaded, adding",
              filteredAmbulances.length,
              "markers"
            );
            filteredAmbulances.forEach((ambulance) => {
              const markerColor = getStatusColor(ambulance.status);
              const markerElement = document.createElement("div");
              markerElement.innerHTML = `<div style="background-color: ${markerColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
            🚑
          </div>`;

              const popup = new window.tt.Popup({ offset: 35 }).setHTML(`
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${
                ambulance.id
              }</h3>
              <p style="margin: 0 0 3px 0; font-size: 12px;"><strong>Type:</strong> ${
                ambulance.type
              }</p>
              <p style="margin: 0 0 3px 0; font-size: 12px;"><strong>Status:</strong> ${getStatusText(
                ambulance.status
              )}</p>
              <p style="margin: 0 0 3px 0; font-size: 12px;"><strong>Driver:</strong> ${
                ambulance.driver.name
              }</p>
              <p style="margin: 0; font-size: 11px; color: #666;">${
                ambulance.location.address
              }</p>
              ${
                ambulance.currentEmergency
                  ? `<p style="margin: 5px 0 0 0; font-size: 11px; color: #ef4444;"><strong>Emergency:</strong> ${ambulance.currentEmergency}</p>`
                  : ""
              }
            </div>
          `);

              console.log("Adding marker for", ambulance.id, "at", [
                ambulance.location.longitude,
                ambulance.location.latitude,
              ]);

              new window.tt.Marker({ element: markerElement })
                .setLngLat([
                  ambulance.location.longitude,
                  ambulance.location.latitude,
                ])
                .setPopup(popup)
                .addTo(map);
            });
            console.log("All markers added successfully!");
          });

          setAmbulanceMap(map);
        } catch (error) {
          console.error("Error initializing ambulance map:", error);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }

    return () => {
      if (ambulanceMap) {
        ambulanceMap.remove();
        setAmbulanceMap(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAmbulances]);

  const handleViewAmbulance = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setDetailModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "#10b981",
      en_route: "#3b82f6",
      at_scene: "#f59e0b",
      maintenance: "#6b7280",
      out_of_service: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusChipColor = (status) => {
    const colors = {
      available: "success",
      en_route: "primary",
      at_scene: "warning",
      maintenance: "default",
      out_of_service: "error",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusMap = {
      available: "Available",
      en_route: "En Route",
      at_scene: "At Scene",
      maintenance: "Maintenance",
      out_of_service: "Out of Service",
    };
    return statusMap[status] || status;
  };

  const getCounts = () => {
    return {
      total: ambulances.length,
      available: ambulances.filter((a) => a.status === "available").length,
      active: ambulances.filter(
        (a) => a.status === "en_route" || a.status === "at_scene"
      ).length,
      maintenance: ambulances.filter(
        (a) => a.status === "maintenance" || a.status === "out_of_service"
      ).length,
    };
  };

  const counts = getCounts();

  const handleCreateAmbulance = () => {
    alert("Ambulance created successfully!");
    setNewAmbulanceModalOpen(false);
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
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Ambulance Fleet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and monitor all ambulance units
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setNewAmbulanceModalOpen(true)}
          >
            Add Ambulance
          </Button>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb" }}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <DirectionsCar sx={{ color: "#3b82f6" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {counts.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Fleet
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
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
                    {counts.available}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Available
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
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
                  <LocalHospital sx={{ color: "#f59e0b" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#f59e0b">
                    {counts.active}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb" }}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Build sx={{ color: "#6b7280" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#6b7280">
                    {counts.maintenance}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Maintenance
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Fleet Map */}
        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Fleet Location Map
          </Typography>
          <Box
            id="ambulance-fleet-map"
            sx={{
              width: "100%",
              height: "400px",
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "#f5f5f5",
            }}
          />
        </Paper>

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", mb: 3 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search ambulances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="en_route">En Route</MenuItem>
                <MenuItem value="at_scene">At Scene</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="out_of_service">Out of Service</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Advanced Life Support">
                  Advanced Life Support
                </MenuItem>
                <MenuItem value="Basic Life Support">
                  Basic Life Support
                </MenuItem>
                <MenuItem value="Patient Transport">Patient Transport</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Ambulance Table */}
        <Paper
          elevation={0}
          sx={{ border: "1px solid #e5e7eb", overflow: "hidden" }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell>Ambulance ID</TableCell>
                  <TableCell>Vehicle Number</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Current Emergency</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAmbulances.map((ambulance) => (
                  <TableRow key={ambulance.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 1,
                            bgcolor: getStatusColor(ambulance.status),
                          }}
                        >
                          <DirectionsCar sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {ambulance.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ambulance.vehicleNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{ambulance.type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(ambulance.status)}
                        size="small"
                        color={getStatusChipColor(ambulance.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ambulance.driver.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ambulance.driver.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {ambulance.location.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {ambulance.currentEmergency ? (
                        <Chip
                          label={ambulance.currentEmergency}
                          size="small"
                          color="error"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewAmbulance(ambulance)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="default">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
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
              Showing {filteredAmbulances.length} of {ambulances.length}{" "}
              ambulances
            </Typography>
          </Box>
        </Paper>

        {/* Ambulance Detail Modal */}
        <Modal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
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
                width: { xs: "90%", sm: 700 },
                maxHeight: "90vh",
                overflow: "auto",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 24,
              }}
            >
              {selectedAmbulance && (
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
                      Ambulance Details
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setDetailModalOpen(false)}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={3}
                    >
                      <Box>
                        <Typography variant="h5" fontWeight={600}>
                          {selectedAmbulance.id}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {selectedAmbulance.vehicleNumber}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(selectedAmbulance.status)}
                        color={getStatusChipColor(selectedAmbulance.status)}
                      />
                    </Box>

                    <Grid container spacing={3} mb={3}>
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ bgcolor: "#f9fafb" }}>
                          <CardContent>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              TYPE
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedAmbulance.type}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ bgcolor: "#f9fafb" }}>
                          <CardContent>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              TOTAL TRIPS
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedAmbulance.totalTrips}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Box mb={3}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        gutterBottom
                      >
                        Current Location
                      </Typography>
                      <Box
                        display="flex"
                        alignItems="start"
                        sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 1 }}
                      >
                        <LocationOn sx={{ color: "#6b7280", mr: 1, mt: 0.5 }} />
                        <Typography variant="body2">
                          {selectedAmbulance.location.address}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={3}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        gutterBottom
                      >
                        Driver Information
                      </Typography>
                      <Card sx={{ bgcolor: "#f9fafb" }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                bgcolor: "#3b82f6",
                              }}
                            >
                              {selectedAmbulance.driver.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {selectedAmbulance.driver.name}
                              </Typography>
                              <Box display="flex" alignItems="center">
                                <Phone
                                  sx={{
                                    fontSize: 14,
                                    mr: 0.5,
                                    color: "#6b7280",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {selectedAmbulance.driver.phone}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>

                    {selectedAmbulance.crew &&
                      selectedAmbulance.crew.length > 0 && (
                        <Box mb={3}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            gutterBottom
                          >
                            Crew Members ({selectedAmbulance.crew.length})
                          </Typography>
                          <Grid container spacing={1}>
                            {selectedAmbulance.crew.map((member, index) => (
                              <Grid item xs={12} sm={6} key={index}>
                                <Card sx={{ bgcolor: "#f9fafb" }}>
                                  <CardContent sx={{ py: 1.5 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {member.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {member.role}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                    <Box mb={3}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        gutterBottom
                      >
                        Equipment
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {selectedAmbulance.equipment.map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box mb={3}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        gutterBottom
                      >
                        Maintenance
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box
                            sx={{ p: 1.5, bgcolor: "#f9fafb", borderRadius: 1 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Last Service
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {new Date(
                                selectedAmbulance.lastMaintenance
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{ p: 1.5, bgcolor: "#f9fafb", borderRadius: 1 }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Next Service
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {new Date(
                                selectedAmbulance.nextMaintenance
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {selectedAmbulance.currentEmergency && (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "#fef3c7",
                          border: "1px solid #fde047",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="#92400e"
                          gutterBottom
                        >
                          Active Emergency
                        </Typography>
                        <Typography variant="body2" color="#92400e">
                          Currently responding to{" "}
                          {selectedAmbulance.currentEmergency}
                        </Typography>
                        {selectedAmbulance.eta && (
                          <Typography variant="caption" color="#92400e">
                            ETA: {selectedAmbulance.eta}
                          </Typography>
                        )}
                      </Box>
                    )}
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
                    <Button
                      variant="outlined"
                      onClick={() => setDetailModalOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Edit />}
                    >
                      Edit Details
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        </Modal>

        {/* New Ambulance Modal */}
        <Modal
          open={newAmbulanceModalOpen}
          onClose={() => setNewAmbulanceModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={newAmbulanceModalOpen}>
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
                  Add New Ambulance
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setNewAmbulanceModalOpen(false)}
                >
                  <Close />
                </IconButton>
              </Box>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Vehicle Number"
                      placeholder="DL-01-XX-0000"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Ambulance Type</InputLabel>
                      <Select label="Ambulance Type">
                        <MenuItem value="Advanced Life Support">
                          Advanced Life Support
                        </MenuItem>
                        <MenuItem value="Basic Life Support">
                          Basic Life Support
                        </MenuItem>
                        <MenuItem value="Patient Transport">
                          Patient Transport
                        </MenuItem>
                        <MenuItem value="Neonatal">Neonatal</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Driver Name" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Driver Phone"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Current Location"
                      placeholder="Hospital name or address"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select label="Status" defaultValue="available">
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                        <MenuItem value="out_of_service">
                          Out of Service
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
                      label="Equipment List"
                      placeholder="Defibrillator, Oxygen, Stretcher..."
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
                  justifyContent: "flex-end",
                  gap: 1,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setNewAmbulanceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateAmbulance}
                >
                  Add Ambulance
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Box>
  );
};

export default Ambulances;
