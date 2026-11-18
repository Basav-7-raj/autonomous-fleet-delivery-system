import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import axios from 'axios';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as VehicleIcon,
  AcUnit as ColdIcon,
  LocalFireDepartment as HotIcon,
  Scale as SizeIcon,
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

// Mock data for item types (keep this as it's not dynamic from DB)
const itemTypes = [
  { id: 'hot_food', name: 'Hot Food', icon: <HotIcon />, requirements: ['Temperature Control', 'Heated Storage'] },
  { id: 'cold_food', name: 'Cold Food', icon: <ColdIcon />, requirements: ['Temperature Control', 'Cold Storage'] },
  { id: 'large_items', name: 'Large Items', icon: <SizeIcon />, requirements: ['Large Capacity'] },
  { id: 'regular_items', name: 'Regular Items', icon: <VehicleIcon />, requirements: ['Standard Size'] },
];

function VehicleTypeConfig() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    features: [],
    suitableFor: [],
    image: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/vehicle-types', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicleTypes(response.data);
    } catch (err) {
      console.error('Error fetching vehicle types:', err);
      setError('Failed to load vehicle types.');
      setSnackbarMessage('Failed to load vehicle types.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setSelectedVehicle(null);
      setFormData({
        name: '',
        capacity: '',
        features: [],
        suitableFor: [],
        image: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVehicle(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (event) => {
    setFormData(prev => ({
      ...prev,
      features: event.target.value,
    }));
  };

  const handleSuitableForChange = (event) => {
    setFormData(prev => ({
      ...prev,
      suitableFor: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (selectedVehicle) {
        // Update existing vehicle type
        await axios.patch(`https://autonomous-vehicle-lyze.onrender.com/api/vehicle-types/${selectedVehicle._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbarMessage('Vehicle type updated successfully!');
        setSnackbarSeverity('success');
      } else {
        // Add new vehicle type
        await axios.post('https://autonomous-vehicle-lyze.onrender.com/api/vehicle-types', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbarMessage('Vehicle type added successfully!');
        setSnackbarSeverity('success');
      }
      setSnackbarOpen(true);
      handleCloseDialog();
      fetchVehicleTypes(); // Re-fetch all vehicle types to update the list
    } catch (err) {
      console.error('Error saving vehicle type:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save vehicle type.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://autonomous-vehicle-lyze.onrender.com/api/vehicle-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbarMessage('Vehicle type deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchVehicleTypes(); // Re-fetch all vehicle types to update the list
    } catch (err) {
      console.error('Error deleting vehicle type:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete vehicle type.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const getFeatureIcon = (feature) => {
    switch (feature) {
      case 'Temperature Control':
        return <ColdIcon />;
      case 'Heated Storage':
        return <HotIcon />;
      case 'Cold Storage':
        return <ColdIcon />;
      case 'Large Capacity':
        return <SizeIcon />;
      default:
        return <VehicleIcon />;
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Vehicle Type Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Vehicle Type
        </Button>
      </Box>
      {loading && <Typography>Loading vehicle types...</Typography>}
      {error && !snackbarOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && vehicleTypes.length === 0 && !error && (
        <Typography>No vehicle types found. Add a new one!</Typography>
      )}

      <Grid container spacing={3}>
        {vehicleTypes.map((vehicle) => (
          <Grid item xs={12} md={6} key={vehicle._id}> {/* Use _id from MongoDB */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {vehicle.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(vehicle)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(vehicle._id)} // Use _id for delete
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Capacity: {vehicle.capacity}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Features:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {vehicle.features.map((feature) => (
                    <Chip
                      key={feature}
                      icon={getFeatureIcon(feature)}
                      label={feature}
                      size="small"
                    />
                  ))}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Suitable For:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {vehicle.suitableFor.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedVehicle ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Vehicle Type Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
            <InputLabel>Capacity</InputLabel>
            <Select
              name="capacity"
              value={formData.capacity}
              label="Capacity"
              onChange={handleInputChange}
            >
              <MenuItem value="Small">Small</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Large">Large</MenuItem>
              <MenuItem value="Extra Large">Extra Large</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
            <InputLabel>Features</InputLabel>
            <Select
              name="features"
              multiple
              value={formData.features}
              onChange={handleFeatureChange}
              label="Features"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {[ 'Temperature Control', 'Heated Storage', 'Cold Storage', 'Large Capacity', 'Standard Size'].map((feature) => (
                <MenuItem key={feature} value={feature}>
                  {feature}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
            <InputLabel>Suitable For</InputLabel>
            <Select
              name="suitableFor"
              multiple
              value={formData.suitableFor}
              onChange={handleSuitableForChange}
              label="Suitable For"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {itemTypes.map((item) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Image URL (optional)"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedVehicle ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default VehicleTypeConfig;