import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import VehicleModel from './VehicleModel';

function DamageAssessment({ open, onClose, vehicleId }) {
  const [images, setImages] = useState([]);
  const [damagePoints, setDamagePoints] = useState([]);
  const [description, setDescription] = useState('');
  const [currentView, setCurrentView] = useState('front'); // front, back, left, right

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    onDrop: acceptedFiles => {
      setImages(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))]);
    }
  });

  const handleAddDamagePoint = (position) => {
    setDamagePoints(prev => [...prev, { position, description: '' }]);
  };

  const handleRemoveDamagePoint = (index) => {
    setDamagePoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Here you would typically send the damage report to your backend
    const damageReport = {
      vehicleId,
      images,
      damagePoints,
      description,
      timestamp: new Date().toISOString()
    };
    console.log('Damage Report:', damageReport);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Damage Assessment
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* 3D View */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ height: 400, position: 'relative' }}>
              <Canvas camera={{ position: [5, 5, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <VehicleModel damagePoints={damagePoints} />
                <OrbitControls />
              </Canvas>
              <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                <Button
                  variant="contained"
                  onClick={() => handleAddDamagePoint([0, 0, 0])}
                >
                  Add Damage Point
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Image Upload and Preview */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  mb: 2
                }}
              >
                <input {...getInputProps()} />
                <AddPhotoIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography>
                  Drag and drop images here, or click to select files
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {images.map((file, index) => (
                  <Grid item xs={4} key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={file.preview}
                        alt={`Damage ${index + 1}`}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bgcolor: 'rgba(255,255,255,0.8)'
                        }}
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Damage Points List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Damage Points
              </Typography>
              {damagePoints.map((point, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Damage Point ${index + 1}`}
                    value={point.description}
                    onChange={(e) => {
                      const newPoints = [...damagePoints];
                      newPoints[index].description = e.target.value;
                      setDamagePoints(newPoints);
                    }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveDamagePoint(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Damage Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DamageAssessment; 