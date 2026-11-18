import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Typography,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const AddEmergencyVehicle = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: '',
    location: '',
    coordinates: {
      lat: '',
      lng: ''
    },
    crew: [{ name: '', role: '', contact: '' }],
    equipment: [{ name: '', quantity: '' }],
    lastMaintenance: '',
    nextMaintenance: ''
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCrewChange = (index, field, value) => {
    const newCrew = [...formData.crew];
    newCrew[index] = { ...newCrew[index], [field]: value };
    setFormData(prev => ({ ...prev, crew: newCrew }));
  };

  const handleEquipmentChange = (index, field, value) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index] = { ...newEquipment[index], [field]: value };
    setFormData(prev => ({ ...prev, equipment: newEquipment }));
  };

  const addCrewMember = () => {
    setFormData(prev => ({
      ...prev,
      crew: [...prev.crew, { name: '', role: '', contact: '' }]
    }));
  };

  const removeCrewMember = (index) => {
    setFormData(prev => ({
      ...prev,
      crew: prev.crew.filter((_, i) => i !== index)
    }));
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, { name: '', quantity: '' }]
    }));
  };

  const removeEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called!');
    try {
      const response = await axios.post(`https://autonomous-vehicle-lyze.onrender.com/api/emergency-vehicles`, formData);
      console.log('Vehicle added successfully:', response.data);
      onSuccess(response.data);
      setSnackbar({ open: true, message: 'Emergency vehicle added successfully!', severity: 'success' });
      onClose();
    } catch (error) {
      console.error('Error adding emergency vehicle:', error);
      setSnackbar({ open: true, message: 'Failed to add emergency vehicle.', severity: 'error' });
      // Optionally keep the dialog open or close based on error type
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Emergency Vehicle</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vehicle ID"
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Vehicle Type"
                >
                  <MenuItem value="AMBULANCE">Ambulance</MenuItem>
                  <MenuItem value="POLICE">Police Vehicle</MenuItem>
                  <MenuItem value="FIRE_TRUCK">Fire Truck</MenuItem>
                  <MenuItem value="RESCUE_VEHICLE">Rescue Vehicle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                name="coordinates.lat"
                type="number"
                value={formData.coordinates.lat}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="coordinates.lng"
                type="number"
                value={formData.coordinates.lng}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Crew Members
                <IconButton onClick={addCrewMember} color="primary">
                  <AddIcon />
                </IconButton>
              </Typography>
              {formData.crew.map((member, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={member.name}
                        onChange={(e) => handleCrewChange(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth required>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={member.role}
                          onChange={(e) => handleCrewChange(index, 'role', e.target.value)}
                          label="Role"
                        >
                          <MenuItem value="DRIVER">Driver</MenuItem>
                          <MenuItem value="PARAMEDIC">Paramedic</MenuItem>
                          <MenuItem value="OFFICER">Officer</MenuItem>
                          <MenuItem value="FIREFIGHTER">Firefighter</MenuItem>
                          <MenuItem value="RESCUE_SPECIALIST">Rescue Specialist</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Contact"
                        value={member.contact}
                        onChange={(e) => handleCrewChange(index, 'contact', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton onClick={() => removeCrewMember(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Equipment
                <IconButton onClick={addEquipment} color="primary">
                  <AddIcon />
                </IconButton>
              </Typography>
              {formData.equipment.map((item, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Equipment Name"
                        value={item.name}
                        onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleEquipmentChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <IconButton onClick={() => removeEquipment(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Maintenance Date"
                name="lastMaintenance"
                type="date"
                value={formData.lastMaintenance}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Next Maintenance Date"
                name="nextMaintenance"
                type="date"
                value={formData.nextMaintenance}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Vehicle
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default AddEmergencyVehicle; 