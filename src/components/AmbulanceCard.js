import React from 'react';
import { Box, Paper, Typography, Grid, Chip } from '@mui/material';
import { LocalHospital, Speed, CheckCircle, Cancel } from '@mui/icons-material';

/**
 * AmbulanceCard Component
 * Displays ambulance information in a card format
 */
const AmbulanceCard = ({ ambulance, isSelected, onClick }) => {
  const statusColors = {
    available: 'success',
    dispatched: 'warning',
    busy: 'error',
    maintenance: 'default',
  };

  return (
    <Paper
      elevation={isSelected ? 8 : 2}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: isSelected ? '3px solid #4caf50' : 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
      onClick={onClick}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" fontWeight="bold">
          🚑 {ambulance.vehicle_number}
        </Typography>
        <Chip
          label={ambulance.status}
          color={statusColors[ambulance.status]}
          size="small"
          icon={ambulance.status === 'available' ? <CheckCircle /> : <Cancel />}
        />
      </Box>

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            <strong>Driver:</strong> {ambulance.driver_name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            <strong>Contact:</strong> {ambulance.driver_contact}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            <strong>Features:</strong> {ambulance.features?.join(', ') || 'Basic'}
          </Typography>
        </Grid>
        {ambulance.eta && (
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Speed color="primary" />
              <Typography variant="body2" fontWeight="bold" color="primary">
                ETA: {ambulance.eta}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default AmbulanceCard;
