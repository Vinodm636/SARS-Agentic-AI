import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  LocalHospital,
  Warning,
  Speed,
  AccessTime,
  WbSunny,
  Cloud,
  CheckCircle,
} from '@mui/icons-material';

/**
 * StatusPanel Component
 * Displays system status, weather, traffic predictions, and statistics
 */
const StatusPanel = ({ ambulanceData = [], emergencyData = [] }) => {
  const [stats, setStats] = useState({
    activeAmbulances: 0,
    activeEmergencies: 0,
    avgResponseTime: 0,
    trafficPrediction: 'Moderate',
    confidence: 85,
    weather: 'Clear',
    temperature: '24°C',
  });

  useEffect(() => {
    updateStats();
  }, [ambulanceData, emergencyData]);

  const updateStats = () => {
    const activeAmbulances = ambulanceData.filter(amb => amb.status === 'available').length;
    const activeEmergencies = emergencyData.length;
    const avgResponseTime = calculateAverageResponseTime(emergencyData);
    
    setStats(prev => ({
      ...prev,
      activeAmbulances,
      activeEmergencies,
      avgResponseTime,
    }));
  };

  const calculateAverageResponseTime = (emergencies) => {
    if (emergencies.length === 0) return 0;
    const totalResponseTime = emergencies.reduce((total, emergency) => 
      total + (emergency.responseTime || 0), 0
    );
    return (totalResponseTime / emergencies.length).toFixed(1);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
        System Status
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: '#dbeafe',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Active Ambulances
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#1e40af">
              {stats.activeAmbulances}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: '#fee2e2',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Emergencies
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#991b1b">
              {stats.activeEmergencies}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: '#d1fae5',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Avg Response
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="#047857">
              {stats.avgResponseTime}m
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              bgcolor: '#fef3c7',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              System Status
            </Typography>
            <Box display="flex" alignItems="center" mt={0.5}>
              <CheckCircle sx={{ color: '#047857', fontSize: 20, mr: 0.5 }} />
              <Typography variant="body2" fontWeight="bold" color="#92400e">
                Operational
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Traffic Prediction */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid #e5e7eb',
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Traffic Prediction
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center">
            <Speed sx={{ color: '#f59e0b', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="500">
              {stats.trafficPrediction}
            </Typography>
          </Box>
          <Chip 
            label={`${stats.confidence}% Confidence`}
            size="small"
            sx={{ 
              bgcolor: alpha(getConfidenceColor(stats.confidence), 0.1),
              color: getConfidenceColor(stats.confidence),
              fontWeight: 600,
            }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={stats.confidence}
          sx={{
            height: 6,
            borderRadius: 1,
            bgcolor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              bgcolor: getConfidenceColor(stats.confidence),
              borderRadius: 1,
            },
          }}
        />
      </Paper>

      {/* Weather Conditions */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid #e5e7eb',
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Weather Conditions
        </Typography>
        <Box display="flex" alignItems="center">
          <WbSunny sx={{ color: '#f59e0b', fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="body1" fontWeight="500">
              {stats.weather}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.temperature} • Low wind
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* System Indicators */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: '1px solid #e5e7eb',
          borderRadius: 1,
          flex: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          System Indicators
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            GPS Tracking
          </Typography>
          <Chip
            label="Operational"
            size="small"
            sx={{
              bgcolor: '#d1fae5',
              color: '#047857',
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Communication
          </Typography>
          <Chip
            label="Operational"
            size="small"
            sx={{
              bgcolor: '#d1fae5',
              color: '#047857',
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            API Services
          </Typography>
          <Chip
            label="Operational"
            size="small"
            sx={{
              bgcolor: '#d1fae5',
              color: '#047857',
              fontWeight: 500,
              fontSize: '0.7rem',
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

// Helper function for alpha transparency
function alpha(color, opacity) {
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}

export default StatusPanel;
