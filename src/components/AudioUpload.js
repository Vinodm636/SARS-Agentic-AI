import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  AudioFile,
  CheckCircle,
} from '@mui/icons-material';
import { transcriptionAPI, getErrorMessage } from '../services/api';

/**
 * AudioUpload Component
 * Handles MP3 file upload with drag-and-drop functionality
 * Sends to backend for transcription and AI extraction
 */
const AudioUpload = ({ onTranscriptionComplete }) => {
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    // Validate file type - more permissive for audio formats
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a', 'audio/webm', 'audio/ogg'];
    const validExtensions = /\.(mp3|mpeg|wav|m4a|webm|ogg|flac)$/i;
    const isValidType = validTypes.includes(file.type) || file.type.startsWith('audio/') || validExtensions.test(file.name);
    
    if (!isValidType) {
      setError('Please upload a valid audio file (MP3, MPEG, WAV, M4A, WebM, OGG, FLAC)');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setAudioFile(file);
    setError(null);
    setSuccess(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) {
      setError('Please select an audio file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

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
      setSuccess(true);
      
      // Pass the extracted data to parent component
      if (onTranscriptionComplete) {
        onTranscriptionComplete(result);
      }

    } catch (err) {
      setError(getErrorMessage(err, 'Failed to process audio file. Please try again.'));
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setAudioFile(null);
    setSuccess(false);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e5e7eb' }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        📞 Upload Emergency Call Recording
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Upload the MP3 recording of the emergency call. AI will transcribe and extract patient information automatically.
      </Typography>

      {/* Drag and Drop Area */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: isDragging ? '3px dashed #3b82f6' : '2px dashed #d1d5db',
          borderRadius: 1.5,
          p: 4,
          textAlign: 'center',
          backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          mt: 2,
          mb: 2,
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {!audioFile ? (
          <>
            <CloudUpload sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Drag & drop your audio file here, or click to browse
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports MP3, WAV, M4A (Max 50MB)
            </Typography>
          </>
        ) : (
          <Box>
            {success ? (
              <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
            ) : (
              <AudioFile sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
            )}
            <Typography variant="body1" gutterBottom>
              {audioFile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(audioFile.size)}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                disabled={isUploading}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.mpeg,.wav,.m4a,.webm,.ogg,.flac"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Upload Progress */}
      {isUploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Processing audio... This may take a minute.
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Audio transcribed successfully! Patient information has been extracted.
        </Alert>
      )}

      {/* Upload Button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudUpload />}
        onClick={handleUpload}
        disabled={!audioFile || isUploading || success}
        fullWidth
        size="large"
      >
        {isUploading ? 'Processing...' : 'Upload & Transcribe'}
      </Button>
    </Paper>
  );
};

export default AudioUpload;
