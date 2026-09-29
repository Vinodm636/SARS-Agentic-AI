import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  TrendingDown,
  TrendingUp,
  TrendingFlat,
  Download,
  MoreVert,
  AccessTime,
  Warning,
  LocalHospital,
  DirectionsCar,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [heatmapMap, setHeatmapMap] = useState(null);

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    // Initialize TomTom heatmap
    if (window.tt && !heatmapMap) {
      const timeoutId = setTimeout(() => {
        const container = document.getElementById("heatmap-container");
        if (!container) {
          console.error("Heatmap container not found!");
          return;
        }

        console.log("Initializing heatmap...");

        try {
          const map = window.tt.map({
            key: "JXPnqva3lZanMKstFTttkppZnHor4IXr",
            container: "heatmap-container",
            center: [77.209, 28.6139],
            zoom: 11,
            style:
              "https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main&poi=poi_main",
          });

          map.on("load", () => {
            console.log("Heatmap loaded, adding heatmap layer");
            // Generate heatmap data points
            const heatmapPoints = {
              type: "FeatureCollection",
              features: Array.from({ length: 500 }, () => ({
                type: "Feature",
                properties: {
                  weight: Math.random() * 0.5 + 0.5,
                },
                geometry: {
                  type: "Point",
                  coordinates: [
                    77.209 + (Math.random() - 0.5) * 0.1,
                    28.6139 + (Math.random() - 0.5) * 0.1,
                  ],
                },
              })),
            };

            map.addSource("emergency-heatmap-source", {
              type: "geojson",
              data: heatmapPoints,
            });

            map.addLayer({
              id: "emergency-heatmap-layer",
              type: "heatmap",
              source: "emergency-heatmap-source",
              maxzoom: 18,
              paint: {
                "heatmap-weight": ["get", "weight"],
                "heatmap-intensity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  1,
                  18,
                  3,
                ],
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(33,102,172,0)",
                  0.2,
                  "rgb(103,169,207)",
                  0.4,
                  "rgb(209,229,240)",
                  0.6,
                  "rgb(253,219,199)",
                  0.8,
                  "rgb(239,138,98)",
                  1,
                  "rgb(178,24,43)",
                ],
                "heatmap-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  2,
                  18,
                  25,
                ],
                "heatmap-opacity": 0.8,
              },
            });
            console.log("Heatmap layer added successfully!");
          });

          map.addControl(new window.tt.NavigationControl());
          setHeatmapMap(map);
        } catch (error) {
          console.error("Error initializing heatmap:", error);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }

    return () => {
      if (heatmapMap) {
        heatmapMap.remove();
      }
    };
  }, [heatmapMap]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportReport = () => {
    alert(`Exporting analytics report for period: ${startDate} to ${endDate}`);
  };

  const handleApplyFilters = () => {
    console.log("Applying filters:", { startDate, endDate });
  };

  // Mock data for charts
  const summaryMetrics = [
    {
      title: "Average Response Time",
      value: "8.4 min",
      change: "12% from last month",
      trend: "down",
      icon: <AccessTime />,
      color: "#3b82f6",
    },
    {
      title: "Total Emergencies",
      value: "742",
      change: "8% from last month",
      trend: "up",
      icon: <Warning />,
      color: "#ef4444",
    },
    {
      title: "Ambulance Utilization",
      value: "78.3%",
      change: "5% from last month",
      trend: "up",
      icon: <DirectionsCar />,
      color: "#10b981",
    },
    {
      title: "Avg Hospital Transfer Time",
      value: "24.5 min",
      change: "No change",
      trend: "flat",
      icon: <LocalHospital />,
      color: "#f59e0b",
    },
  ];

  // Emergency Types Pie Chart Data
  const emergencyTypesData = {
    labels: [
      "Medical",
      "Traffic Accident",
      "Fire",
      "Natural Disaster",
      "Industrial",
      "Other",
    ],
    datasets: [
      {
        data: [450, 220, 130, 65, 42, 35],
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(249, 115, 22, 0.7)",
        ],
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  // Response Time Trend Line Chart Data
  const responseTimeTrendData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Average Response Time (minutes)",
        data: [9.2, 8.8, 8.5, 8.9, 8.3, 7.9, 8.1, 8.4, 8.0, 7.8, 8.2, 8.4],
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Response Time by District Bar Chart Data
  const responseTimeDistrictData = {
    labels: [
      "Downtown",
      "Midtown",
      "Uptown",
      "West Side",
      "East Side",
      "South End",
      "North End",
      "Industrial",
      "Suburban",
      "Waterfront",
    ],
    datasets: [
      {
        label: "Average Response Time (minutes)",
        data: [12.5, 9.8, 7.2, 8.5, 10.3, 6.8, 7.5, 11.2, 9.1, 8.9],
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(16, 185, 129, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Ambulance Status Doughnut Chart Data
  const ambulanceStatusData = {
    labels: ["Available", "En Route", "At Scene", "Out of Service"],
    datasets: [
      {
        data: [22, 15, 8, 3],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(107, 114, 128, 0.7)",
        ],
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  // Daily Trend Bar Chart Data
  const dailyTrendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "This Week",
        data: [18, 22, 25, 20, 24, 28, 19],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Last Week",
        data: [15, 19, 21, 18, 22, 26, 17],
        backgroundColor: "rgba(147, 197, 253, 0.7)",
        borderColor: "rgba(147, 197, 253, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Minutes",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
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
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive performance metrics and insights
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <TextField
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ width: 150 }}
            />
            <Typography variant="body2" color="text.secondary">
              to
            </Typography>
            <TextField
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{ width: 150 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleApplyFilters}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={handleExportReport}
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Summary Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {summaryMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid #e5e7eb",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                      {metric.value}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {metric.trend === "down" && (
                        <TrendingDown
                          sx={{ fontSize: 16, color: "#10b981", mr: 0.5 }}
                        />
                      )}
                      {metric.trend === "up" && (
                        <TrendingUp
                          sx={{ fontSize: 16, color: "#ef4444", mr: 0.5 }}
                        />
                      )}
                      {metric.trend === "flat" && (
                        <TrendingFlat
                          sx={{ fontSize: 16, color: "#f59e0b", mr: 0.5 }}
                        />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            metric.trend === "down"
                              ? "#10b981"
                              : metric.trend === "up"
                              ? "#ef4444"
                              : "#f59e0b",
                        }}
                      >
                        {metric.change}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: `${metric.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: metric.color,
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Emergency Types Chart */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", height: 400 }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={600}>
                  Emergency Types
                </Typography>
                <IconButton size="small" onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
              </Box>
              <Box sx={{ height: 320 }}>
                <Pie data={emergencyTypesData} options={pieChartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Response Time Trend Chart */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", height: 400 }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={600}>
                  Response Time Trend
                </Typography>
                <IconButton size="small" onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
              </Box>
              <Box sx={{ height: 320 }}>
                <Line data={responseTimeTrendData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Row 2 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Emergency Heatmap */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={600}>
                  Emergency Distribution Heatmap
                </Typography>
                <IconButton size="small" onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
              </Box>
              <Box
                id="heatmap-container"
                sx={{
                  width: "100%",
                  height: "400px",
                  borderRadius: 1,
                  overflow: "hidden",
                  bgcolor: "#f5f5f5",
                }}
              />
            </Paper>
          </Grid>

          {/* Response Time by District */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", height: 500 }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={600}>
                  Response Time by District
                </Typography>
                <IconButton size="small" onClick={handleMenuClick}>
                  <MoreVert />
                </IconButton>
              </Box>
              <Box sx={{ height: 420 }}>
                <Bar
                  data={responseTimeDistrictData}
                  options={barChartOptions}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Row 3 */}
        <Grid container spacing={3}>
          {/* Ambulance Fleet Status */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", height: 400 }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Ambulance Fleet Status
              </Typography>
              <Box sx={{ height: 320 }}>
                <Doughnut
                  data={ambulanceStatusData}
                  options={doughnutChartOptions}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Daily Emergency Trend */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid #e5e7eb", height: 400 }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={600}>
                  Daily Emergency Trend
                </Typography>
                <Box display="flex" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: "#3b82f6",
                        borderRadius: 0.5,
                        mr: 1,
                      }}
                    />
                    <Typography variant="caption">This Week</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: "#93c5fd",
                        borderRadius: 0.5,
                        mr: 1,
                      }}
                    />
                    <Typography variant="caption">Last Week</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ height: 320 }}>
                <Bar
                  data={dailyTrendData}
                  options={{
                    ...chartOptions,
                    plugins: { legend: { display: false } },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Download Chart</MenuItem>
          <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
          <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Analytics;
