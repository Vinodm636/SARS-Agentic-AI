import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from "@mui/material";
import {
  Send,
  Person,
  LocalHospital,
  LocationOn,
  Phone,
  Emergency,
} from "@mui/icons-material";
import { dispatchAPI, getErrorMessage } from '../services/api';

/**
 * DispatchForm Component
 * Auto-filled form with patient details extracted from AI transcription
 * Allows manual editing before dispatch
 */
const DispatchForm = ({
  extractedData,
  selectedAmbulance,
  onDispatchSuccess,
}) => {
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientPhone: "",

    // Emergency Details
    emergencyType: "",
    condition: "",
    severity: "moderate",
    specialRequirements: [],

    // Location
    address: "",
    landmark: "",

    // Caller Information
    callerName: "",
    callerRelation: "",
    contactNumber: "",

    // Hospital Destination
    hospitalName: "",
    hospitalAddress: "",

    // Driver Information
    driverPhone: "",

    // Additional
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Special requirements options
  const specialRequirementsOptions = [
    "Oxygen Support",
    "Ventilator",
    "Cardiac Support",
    "Wheelchair",
    "Stretcher",
    "Pediatric Care",
    "Critical Care",
    "Blood Bank",
    "Trauma Care",
  ];

  // Auto-fill form when extracted data is received
  useEffect(() => {
    if (extractedData && extractedData.extracted_data) {
      const data = extractedData.extracted_data;

      // Map the extracted data to form fields
      setFormData({
        patientName: data.patient_name || "",
        patientAge: data.patient_age ? String(data.patient_age) : "",
        patientGender: data.patient_gender || "",
        patientPhone: data.patient_phone || "",
        emergencyType: data.emergency_type || "",
        condition: Array.isArray(data.symptoms)
          ? data.symptoms.join(", ")
          : data.symptoms || "",
        severity: data.severity ? data.severity.toLowerCase() : "moderate",
        specialRequirements: Array.isArray(data.special_requirements)
          ? data.special_requirements
          : [],
        address: data.location || "",
        landmark: "",
        callerName: data.caller_name || "",
        callerRelation: "",
        contactNumber: data.caller_phone || "",
        hospitalName: "",
        hospitalAddress: "",
        driverPhone: "",
        additionalNotes: [
          data.consciousness ? `Consciousness: ${data.consciousness}` : "",
          data.breathing ? `Breathing: ${data.breathing}` : "",
          extractedData.transcription
            ? `Call transcript: ${extractedData.transcription.substring(
                0,
                200
              )}...`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }
  }, [extractedData]);

  // Auto-fill driver phone when ambulance is selected
  useEffect(() => {
    if (selectedAmbulance && selectedAmbulance.driver?.phone) {
      setFormData((prev) => ({
        ...prev,
        driverPhone: selectedAmbulance.driver.phone,
      }));
    }
  }, [selectedAmbulance]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAmbulance) {
      setSubmitError("Please select an ambulance from the map");
      return;
    }

    // Validate required fields for SMS
    if (!formData.hospitalName || !formData.hospitalAddress) {
      setSubmitError(
        "Hospital name and address are required for SMS notification"
      );
      return;
    }

    if (!formData.driverPhone) {
      setSubmitError("Driver phone number is required for SMS notification");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const dispatchData = {
        ambulance_id: selectedAmbulance.ambulance_id,
        emergency_id: `EMG-${Date.now()}`,
        hospital_name: formData.hospitalName,
        hospital_address: formData.hospitalAddress,
        driver_phone: formData.driverPhone,
        patient_info: `${formData.patientName}, ${formData.patientAge} years, ${formData.patientGender}, ${formData.emergencyType} - ${formData.condition}`,
        eta: selectedAmbulance.eta || "Calculating...",
        // Additional data for reference
        patient_details: {
          patient_name: formData.patientName,
          patient_age: parseInt(formData.patientAge) || null,
          patient_gender: formData.patientGender,
          patient_phone: formData.patientPhone,
          emergency_type: formData.emergencyType,
          condition: formData.condition,
          severity: formData.severity,
          special_requirements: formData.specialRequirements,
          additional_notes: formData.additionalNotes,
        },
        location: {
          address: formData.address,
          landmark: formData.landmark,
        },
        caller_info: {
          caller_name: formData.callerName,
          caller_relation: formData.callerRelation,
          contact_number: formData.contactNumber,
        },
      };

      const response = await dispatchAPI.createDispatch(dispatchData);

      if (onDispatchSuccess) {
        onDispatchSuccess(response);
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to dispatch ambulance. Please try again."));
      console.error("Dispatch error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e5e7eb" }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        📋 Patient & Emergency Details
      </Typography>

      {extractedData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          ✨ Form auto-filled from call recording. Please review and edit if
          needed.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Patient Information */}
        <Typography
          variant="subtitle1"
          sx={{ mt: 2, mb: 1, display: "flex", alignItems: "center" }}
        >
          <Person sx={{ mr: 1 }} /> Patient Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Patient Name"
              value={formData.patientName}
              onChange={(e) => handleInputChange("patientName", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.patientAge}
              onChange={(e) => handleInputChange("patientAge", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.patientGender}
                label="Gender"
                onChange={(e) =>
                  handleInputChange("patientGender", e.target.value)
                }
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Patient Phone Number"
              value={formData.patientPhone}
              onChange={(e) =>
                handleInputChange("patientPhone", e.target.value)
              }
              placeholder="e.g., +1234567890"
              InputProps={{
                startAdornment: (
                  <Phone sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Emergency Details */}
        <Typography
          variant="subtitle1"
          sx={{ mt: 3, mb: 1, display: "flex", alignItems: "center" }}
        >
          <LocalHospital sx={{ mr: 1 }} /> Emergency Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Emergency Type"
              value={formData.emergencyType}
              onChange={(e) =>
                handleInputChange("emergencyType", e.target.value)
              }
              placeholder="e.g., Heart Attack, Accident, etc."
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Severity</InputLabel>
              <Select
                value={formData.severity}
                label="Severity"
                onChange={(e) => handleInputChange("severity", e.target.value)}
              >
                <MenuItem value="critical">
                  <Chip
                    label="Critical"
                    color="error"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  Critical
                </MenuItem>
                <MenuItem value="serious">
                  <Chip
                    label="Serious"
                    color="warning"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  Serious
                </MenuItem>
                <MenuItem value="moderate">
                  <Chip
                    label="Moderate"
                    color="info"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  Moderate
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Patient Condition"
              value={formData.condition}
              onChange={(e) => handleInputChange("condition", e.target.value)}
              multiline
              rows={2}
              placeholder="Describe the patient's current condition"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={specialRequirementsOptions}
              value={formData.specialRequirements}
              onChange={(e, newValue) =>
                handleInputChange("specialRequirements", newValue)
              }
              ListboxProps={{
                style: { maxHeight: 250 },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Special Requirements"
                  placeholder="Select required medical equipment"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option}
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    size="small"
                  />
                ))
              }
              sx={{
                "& .MuiAutocomplete-inputRoot": {
                  minHeight: "56px",
                  alignItems: "center",
                },
                "& .MuiAutocomplete-input": {
                  minHeight: "40px",
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Location */}
        <Typography
          variant="subtitle1"
          sx={{ mt: 3, mb: 1, display: "flex", alignItems: "center" }}
        >
          <LocationOn sx={{ mr: 1 }} /> Pickup Location
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              multiline
              rows={2}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Landmark"
              value={formData.landmark}
              onChange={(e) => handleInputChange("landmark", e.target.value)}
              placeholder="e.g., Near XYZ Hospital"
            />
          </Grid>
        </Grid>

        {/* Caller Information */}
        <Typography
          variant="subtitle1"
          sx={{ mt: 3, mb: 1, display: "flex", alignItems: "center" }}
        >
          <Phone sx={{ mr: 1 }} /> Caller Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Caller Name"
              value={formData.callerName}
              onChange={(e) => handleInputChange("callerName", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Relation to Patient"
              value={formData.callerRelation}
              onChange={(e) =>
                handleInputChange("callerRelation", e.target.value)
              }
              placeholder="e.g., Father, Friend"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Contact Number"
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange("contactNumber", e.target.value)
              }
              required
            />
          </Grid>
        </Grid>

        {/* Hospital Destination */}
        <Typography
          variant="subtitle1"
          sx={{ mt: 3, mb: 1, display: "flex", alignItems: "center" }}
        >
          <LocalHospital sx={{ mr: 1 }} /> Hospital Destination
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hospital Name"
              value={formData.hospitalName}
              onChange={(e) =>
                handleInputChange("hospitalName", e.target.value)
              }
              placeholder="e.g., AIIMS Hospital, Apollo Hospital"
              required
              helperText="Required for SMS notification to driver"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Driver Phone Number"
              value={formData.driverPhone}
              onChange={(e) => handleInputChange("driverPhone", e.target.value)}
              placeholder="e.g., +919876543210"
              required
              helperText="E.164 format with country code (e.g., +91 for India)"
              InputProps={{
                startAdornment: (
                  <Phone sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Hospital Address"
              value={formData.hospitalAddress}
              onChange={(e) =>
                handleInputChange("hospitalAddress", e.target.value)
              }
              multiline
              rows={2}
              placeholder="Complete address of the hospital"
              required
              helperText="Full address will be sent to the driver via SMS"
            />
          </Grid>
        </Grid>

        {/* Additional Notes */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes"
              value={formData.additionalNotes}
              onChange={(e) =>
                handleInputChange("additionalNotes", e.target.value)
              }
              multiline
              rows={2}
              placeholder="Any other important information"
            />
          </Grid>
        </Grid>

        {/* Submit Error */}
        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Selected Ambulance Info */}
        {selectedAmbulance && (
          <Alert severity="success" sx={{ mt: 2 }}>
            🚑 Selected Ambulance: {selectedAmbulance.vehicle_number} - ETA:{" "}
            {selectedAmbulance.eta || "Calculating..."}
            <br />
            📱 Driver: {selectedAmbulance.driver?.name || "N/A"} - Phone:{" "}
            {selectedAmbulance.driver?.phone || "Not available"}
          </Alert>
        )}

        {!selectedAmbulance && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            ⚠️ Please select an ambulance from the map to continue
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="error"
          size="large"
          fullWidth
          startIcon={<Emergency />}
          endIcon={<Send />}
          disabled={isSubmitting || !selectedAmbulance}
          sx={{ mt: 3, py: 1.5 }}
        >
          {isSubmitting ? "Dispatching..." : "Dispatch Ambulance"}
        </Button>
      </Box>
    </Paper>
  );
};

export default DispatchForm;
