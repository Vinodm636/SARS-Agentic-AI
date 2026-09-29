/**
 * API Service Layer for SARS
 * Handles all backend communication
 */

import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api').trim();

export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;

    if (Array.isArray(detail)) {
      const firstIssue = detail[0];
      if (firstIssue && typeof firstIssue === 'object' && typeof firstIssue.msg === 'string') {
        return firstIssue.msg;
      }
    }

    if (typeof detail === 'string') {
      return detail;
    }
  }

  if (typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }

  if (typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes timeout for long-running operations like audio transcription
});

// Transcription API
export const transcriptionAPI = {
  /**
   * Upload audio file and get transcription with extracted data
   */
  uploadAndTranscribe: async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await apiClient.post('/transcription/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Return the data object which contains transcription and extracted_data
    return response.data.data || response.data;
  },
};

// Ambulance API
export const ambulanceAPI = {
  /**
   * Get all available ambulances
   */
  getAllAmbulances: async () => {
    const response = await apiClient.get('/ambulances');
    return response.data;
  },

  /**
   * Get ambulances by agency
   */
  getByAgency: async (agencyId) => {
    const response = await apiClient.get(`/ambulances/agency/${agencyId}`);
    return response.data;
  },

  /**
   * Update ambulance location
   */
  updateLocation: async (ambulanceId, location) => {
    const response = await apiClient.put(`/ambulances/${ambulanceId}/location`, location);
    return response.data;
  },

  /**
   * Update ambulance status
   */
  updateStatus: async (ambulanceId, status) => {
    const response = await apiClient.put(`/ambulances/${ambulanceId}/status`, { status });
    return response.data;
  },
};

// Dispatch API
export const dispatchAPI = {
  /**
   * Create new dispatch — response now includes sms_status alongside whatsapp_status
   */
  createDispatch: async (dispatchData) => {
    const response = await apiClient.post('/dispatch', dispatchData);
    return response.data;
  },

  /**
   * Get all dispatches
   */
  getAllDispatches: async () => {
    const response = await apiClient.get('/dispatch');
    return response.data;
  },

  /**
   * Get dispatch by ID (includes sms_status, sms_sent_at, sms_message_id fields)
   */
  getDispatchById: async (dispatchId) => {
    const response = await apiClient.get(`/dispatch/${dispatchId}`);
    return response.data;
  },

  /**
   * Get SMS-only notification status for a dispatch.
   * Returns: { dispatch_id, ambulance_id, driver_name, driver_phone_masked,
   *            sms_status, sms_sent_at, sms_message_id, sms_error, sms_mock }
   * Phone number is masked server-side (last 4 digits visible only).
   */
  getSmsStatus: async (dispatchId) => {
    const response = await apiClient.get(`/dispatch/${dispatchId}/sms-status`);
    return response.data;
  },

  /**
   * Update dispatch status
   */
  updateStatus: async (dispatchId, status) => {
    const response = await apiClient.put(`/dispatch/${dispatchId}/status`, { status });
    return response.data;
  },
};

// Maps & Routing API
export const mapsAPI = {
  /**
   * Calculate ETA for ambulances to patient location
   */
  calculateETA: async (ambulanceLocations, patientLocation) => {
    const response = await apiClient.post('/maps/calculate-eta', {
      ambulances: ambulanceLocations,
      destination: patientLocation,
    });
    return response.data;
  },

  /**
   * Get optimized route
   */
  getRoute: async (origin, destination) => {
    const response = await apiClient.post('/maps/route', {
      origin,
      destination,
    });
    return response.data;
  },
};

// Agency API
export const agencyAPI = {
  /**
   * Get all agencies
   */
  getAllAgencies: async () => {
    const response = await apiClient.get('/agencies');
    return response.data;
  },

  /**
   * Get agency by ID
   */
  getAgencyById: async (agencyId) => {
    const response = await apiClient.get(`/agencies/${agencyId}`);
    return response.data;
  },
};

// Tracking API (WebSocket alternative using polling)
export const trackingAPI = {
  /**
   * Get real-time locations of all ambulances
   */
  getLiveLocations: async () => {
    const response = await apiClient.get('/tracking/locations');
    return response.data;
  },

  /**
   * Update ambulance location (from mobile app or GPS)
   */
  updateLocation: async (ambulanceId, location) => {
    const response = await apiClient.post('/tracking/update', {
      ambulance_id: ambulanceId,
      ...location,
    });
    return response.data;
  },
};

export default {
  transcriptionAPI,
  ambulanceAPI,
  dispatchAPI,
  mapsAPI,
  agencyAPI,
  trackingAPI,
};
