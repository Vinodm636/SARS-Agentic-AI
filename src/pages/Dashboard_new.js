import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  LocalHospital,
  Speed,
  Warning,
  CheckCircle,
  TrendingUp,
  Cloud,
  LocalShipping,
  Emergency,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * Dashboard Page
 * Overview dashboard showing system status and statistics
 */
const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mock data for dashboard
  const stats = {
    activeAmbulances: 12,
    totalAmbulances: 15,
    activeEmergencies: 8,
    averageResponseTime: '8.5 min',
    trafficIndex: 67,
    weather: 'Clear',
    systemStatus: 'Operational',
  };

  // Response time trend data
  const responseTimeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Response Time (min)',
        data: [9.2, 8.7, 8.5, 9.1, 8.3, 8.8, 8.5],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
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
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Top Mobile Nav */}
      <TopNavBar onMenuClick={() => setMobileOpen(true)} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: { xs: 8, md: 0 },
          ml: { md: '260px' },
        }}
      >
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time system monitoring and statistics
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Active Ambulances */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="#3b82f6">
                      {stats.activeAmbulances}/{stats.totalAmbulances}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Active Ambulances
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocalShipping sx={{ fontSize: 28, color: '#3b82f6' }} />
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.activeAmbulances / stats.totalAmbulances) * 100}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Active Emergencies */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="#ef4444">
                      {stats.activeEmergencies}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Active Emergencies
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Emergency sx={{ fontSize: 28, color: '#ef4444' }} />
                  </Box>
                </Box>
                <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
                  3 Critical
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Average Response Time */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="#10b981">
                      {stats.averageResponseTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Avg Response Time
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#d1fae5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Speed sx={{ fontSize: 28, color: '#10b981' }} />
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                  <TrendingUp sx={{ fontSize: 16, color: '#10b981', mr: 0.5 }} />
                  <Typography variant="caption" color="success.main">
                    12% faster than last week
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Status */}
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      {stats.systemStatus}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      System Status
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#d1fae5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 28, color: '#10b981' }} />
                  </Box>
                </Box>
                <Chip
                  label="All Systems Online"
                  size="small"
                  color="success"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Response Time Trend Chart */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', height: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Response Time Trend
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Average response time over the past week
              </Typography>
              <Box sx={{ height: 250 }}>
                <Line data={responseTimeData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Traffic & Weather */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {/* Traffic Prediction */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Warning sx={{ color: '#f59e0b', mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Traffic Prediction
                    </Typography>
                  </Box>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Traffic Index
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color={stats.trafficIndex > 70 ? '#f59e0b' : '#10b981'}>
                        {stats.trafficIndex}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.trafficIndex}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: stats.trafficIndex > 70 ? '#f59e0b' : '#10b981',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Moderate traffic expected in downtown areas
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Weather */}
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Cloud sx={{ color: '#3b82f6', mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Weather
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        24°C
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stats.weather}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Cloud sx={{ fontSize: 32, color: '#3b82f6' }} />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Good conditions for emergency response
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {[
                  { time: '2 min ago', text: 'AMB-001 dispatched to Medical Emergency at Sector 15', type: 'dispatch' },
                  { time: '5 min ago', text: 'AMB-007 completed Heart Attack response in 7.2 minutes', type: 'complete' },
                  { time: '12 min ago', text: 'Critical emergency reported at MG Road', type: 'emergency' },
                  { time: '18 min ago', text: 'AMB-004 dispatched to Traffic Accident at Ring Road', type: 'dispatch' },
                ].map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      py: 2,
                      borderBottom: index < 3 ? '1px solid #e5e7eb' : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: activity.type === 'emergency' ? '#ef4444' : activity.type === 'complete' ? '#10b981' : '#3b82f6',
                        mt: 0.75,
                        mr: 2,
                      }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2">{activity.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
