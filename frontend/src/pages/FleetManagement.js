import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import axios from 'axios';
import DamageAssessment from '../components/DamageAssessment';

// This should ideally be fetched from the backend or a global config
// For now, keeping it here as it was, but it's a candidate for dynamic loading
const vehicleTypes = [
  'Standard Delivery Van',
  'Refrigerated Truck',
  'Hot Food Delivery Vehicle'
];

const vehicleStatuses = ['active', 'maintenance', 'damaged', 'inactive'];

const API_BASE_URL = 'https://autonomous-vehicle-lyze.onrender.com/api'; // Define API base URL

function FleetManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    type: '',
    status: '',
    batteryLevel: '',
    location: '',
  });
  const [openDamageAssessment, setOpenDamageAssessment] = useState(false);
  const [selectedVehicleForDamage, setSelectedVehicleForDamage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/vehicles`, { // Use absolute URL
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching vehicles',
        severity: 'error',
      });
    }
  };

  const handleOpenDialog = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFormData({
        vehicleId: vehicle.vehicleNumber,
        type: vehicle.type,
        status: vehicle.status,
        batteryLevel: vehicle.batteryLevel || '',
        location: vehicle.currentLocation || '', // Ensure it's a string
      });
    } else {
      setSelectedVehicle(null);
      setFormData({
        vehicleId: '',
        type: '',
        status: '',
        batteryLevel: '',
        location: '',
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      if (selectedVehicle) {
        await axios.patch(`${API_BASE_URL}/vehicles/${selectedVehicle._id}`, formData, { headers }); // Use absolute URL
        setSnackbar({
          open: true,
          message: 'Vehicle updated successfully',
          severity: 'success',
        });
      } else {
        await axios.post(`${API_BASE_URL}/vehicles`, formData, { headers }); // Use absolute URL
        setSnackbar({
          open: true,
          message: 'Vehicle added successfully',
          severity: 'success',
        });
      }
      fetchVehicles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving vehicle',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/vehicles/${id}`, { // Use absolute URL
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSnackbar({
        open: true,
        message: 'Vehicle deleted successfully',
        severity: 'success',
      });
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting vehicle',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      maintenance: 'warning',
      damaged: 'error',
      inactive: 'default',
    };
    return colors[status] || 'default';
  };

  const handleDamageAssessment = (vehicle) => {
    setSelectedVehicleForDamage(vehicle);
    setOpenDamageAssessment(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Fleet Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Vehicle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Battery Level</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell>{vehicle.vehicleNumber}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>
                  <Chip
                    label={vehicle.status.toUpperCase()}
                    color={getStatusColor(vehicle.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{vehicle.batteryLevel || 'N/A'}%</TableCell>
                <TableCell>{vehicle.currentLocation || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(vehicle)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(vehicle._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDamageAssessment(vehicle)}
                  >
                    <BuildIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add New Vehicle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="vehicleId"
            label="Vehicle ID *"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.vehicleId}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="type"
            label="Type *"
            select
            fullWidth
            variant="outlined"
            value={formData.type}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          >
            {vehicleTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="status"
            label="Status *"
            select
            fullWidth
            variant="outlined"
            value={formData.status}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          >
            {vehicleStatuses.map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="batteryLevel"
            label="Battery Level"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.batteryLevel}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.location}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedVehicle ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {selectedVehicleForDamage && (
        <DamageAssessment
          open={openDamageAssessment}
          onClose={() => setOpenDamageAssessment(false)}
          vehicle={selectedVehicleForDamage}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default FleetManagement;