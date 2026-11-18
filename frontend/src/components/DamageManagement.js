import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Mock data for vehicles (for demo purposes if backend data not available)
const mockVehicles = [
  { _id: '60d0fe4f3b5e4b3e8c8e1a1a', vehicleNumber: 'VH001', type: 'Standard Delivery Van' },
  { _id: '60d0fe4f3b5e4b3e8c8e1a1b', vehicleNumber: 'VH002', type: 'Refrigerated Truck' },
  { _id: '60d0fe4f3b5e4b3e8c8e1a1c', vehicleNumber: 'VH003', type: 'Hot Food Delivery Vehicle' },
];

// Mock data for mechanics (for demo purposes if backend data not available or role not found)
const mockMechanics = [
  { _id: '60d0fe4f3b5e4b3e8c8e1a1d', name: 'John Doe', specialization: 'DRONE' },
  { _id: '60d0fe4f3b5e4b3e8c8e1a1e', name: 'Jane Smith', specialization: 'ROBOT' },
  { _id: '60d0fe4f3b5e4b3e8c8e1a1f', name: 'Mike Johnson', specialization: 'AUTONOMOUS_VEHICLE' },
];

const damageStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const API_BASE_URL = 'https://autonomous-vehicle-lyze.onrender.com/api';

function DamageManagement() {
  const [damagedVehicles, setDamagedVehicles] = useState([]);
  const [vehicles, setVehicles] = useState([]); // State to hold vehicles from backend
  const [mechanics, setMechanics] = useState([]); // State to hold mechanics from backend
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false); // New state for add dialog
  const [selectedVehicle, setSelectedVehicle] = useState(null); // For assigning mechanic
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [repairTime, setRepairTime] = useState('');
  const [formData, setFormData] = useState({ // Form data for adding new damage
    vehicleId: '',
    damageDescription: '',
    location: '',
    damageImages: [], // To store URLs, or base64 if actual upload implemented
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [damageRes, vehiclesRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/damage`, { headers }),
        axios.get(`${API_BASE_URL}/vehicles`, { headers }),
        axios.get(`${API_BASE_URL}/users?role=mechanic`, { headers }), // Fetch users with 'mechanic' role
      ]);

      setDamagedVehicles(damageRes.data);
      setVehicles(vehiclesRes.data);
      setMechanics(usersRes.data.filter(user => user.role === 'mechanic'));

    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load data. Please try again.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDamage = () => {
    // Reset form data for a new entry
    setFormData({
      vehicleId: '',
      damageDescription: '',
      location: '',
      damageImages: [],
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setFormData({
      vehicleId: '',
      damageDescription: '',
      location: '',
      damageImages: [], // Ensure damageImages is reset to an empty array
    });
  };

  const handleSaveDamage = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        // Ensure vehicleId is sent as just the ID
        vehicleId: formData.vehicleId,
        // damageImages is an array of objects with a 'url' key, backend expects this
        damageImages: formData.damageImages.filter(img => img.url), // Only send images with URLs
      };

      await axios.post(`${API_BASE_URL}/damage`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbarMessage('Damage report added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAddDialog();
      fetchData(); // Re-fetch data to update the list
    } catch (err) {
      console.error('Error saving damage report:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save damage report.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleAssignMechanic = (vehicle) => {
    setSelectedVehicle(vehicle);
    // Pre-fill if already assigned, ensure it's the _id
    setSelectedMechanic(vehicle.assignedMechanic?._id || '');
    setRepairTime(vehicle.estimatedRepairTime || '');
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedVehicle(null);
    setSelectedMechanic('');
    setRepairTime('');
  };

  const handleSubmitAssignment = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        assignedMechanic: selectedMechanic || null, // Send null if no mechanic selected
        estimatedRepairTime: repairTime || null, // Send null if no time entered
        status: 'IN_PROGRESS', // Automatically set to in-progress when assigned
      };

      await axios.patch(`${API_BASE_URL}/damage/${selectedVehicle._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbarMessage('Mechanic assigned successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseAssignDialog();
      fetchData(); // Re-fetch data to update the list

    } catch (err) {
      console.error('Error assigning mechanic:', err);
      const errorMessage = err.response?.data?.message || 'Failed to assign mechanic.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteDamage = async (damageId) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/damage/${damageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbarMessage('Damage report deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchData(); // Re-fetch all data to update the list
    } catch (err) {
      console.error('Error deleting damage report:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete damage report.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageURLChange = (e) => {
    // This assumes only one image URL for simplicity
    setFormData((prev) => ({ ...prev, damageImages: [{ url: e.target.value }] }));
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Damage Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDamage}
        >
          Add Damage Vehicle
        </Button>
      </Box>

      {loading && <Typography>Loading damage reports...</Typography>}
      {error && !snackbarOpen && <Alert severity="error">{error}</Alert>}
      {!loading && !error && damagedVehicles.length === 0 && (
        <Typography>No damage reports found. Add a new one!</Typography>
      )}

      <Grid container spacing={3}>
        {!loading && !error && damagedVehicles.map((damageReport) => (
          <Grid item xs={12} md={6} key={damageReport._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Vehicle {damageReport.vehicleId?.vehicleNumber || 'N/A'}
                  </Typography>
                  <Chip
                    label={damageReport.status}
                    color={getStatusColor(damageReport.status)}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2}>
                  {damageReport.damageImages && damageReport.damageImages.length > 0 ? (
                    damageReport.damageImages.map((image, index) => (
                      <Grid item xs={6} key={index}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={image.url}
                          alt={`Damage ${index + 1}`}
                          sx={{ borderRadius: 1 }}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">No images available</Typography>
                    </Grid>
                  )}
                </Grid>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Description: {damageReport.damageDescription}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Location: {damageReport.location}
                  </Typography>
                  {damageReport.assignedMechanic && (
                    <Typography variant="body2">
                      Assigned Mechanic: {damageReport.assignedMechanic.name}
                    </Typography>
                  )}
                  {damageReport.estimatedRepairTime && (
                    <Typography variant="body2">
                      Estimated Repair Time: {damageReport.estimatedRepairTime}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {damageReport.status === 'PENDING' && (
                    <Button
                      variant="contained"
                      startIcon={<AssignmentIcon />}
                      onClick={() => handleAssignMechanic(damageReport)}
                      size="small"
                    >
                      Assign Mechanic
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteDamage(damageReport._id)}
                    size="small"
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Damage Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          Add New Damage Report
          <IconButton
            aria-label="close"
            onClick={handleCloseAddDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Vehicle"
              name="vehicleId"
              value={formData.vehicleId || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              {loading && <MenuItem disabled>Loading vehicles...</MenuItem>}
              {(vehicles.length > 0 ? vehicles : mockVehicles).map((vehicle) => (
                <MenuItem key={vehicle._id} value={vehicle._id}>
                  {`${vehicle.vehicleNumber} (${vehicle.type})`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Damage Description"
              name="damageDescription"
              multiline
              rows={3}
              value={formData.damageDescription || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Image URL (Optional)"
              name="damageImages"
              value={formData.damageImages[0]?.url || ''} // Display first image URL if exists
              onChange={handleImageURLChange} // Handle image URL input
              sx={{ mb: 2 }}
              helperText="Enter a URL for a single damage image."
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleSaveDamage} variant="contained">
            Add Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Mechanic Dialog (Existing) */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
        <DialogTitle>
          Assign Mechanic
          <IconButton
            aria-label="close"
            onClick={handleCloseAssignDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Select Mechanic"
              value={selectedMechanic}
              onChange={(e) => setSelectedMechanic(e.target.value)}
              sx={{ mb: 2 }}
            >
              {loading && <MenuItem disabled>Loading mechanics...</MenuItem>}
              {(mechanics.length > 0 ? mechanics : mockMechanics).map((mechanic) => (
                <MenuItem key={mechanic._id} value={mechanic._id}>
                  {mechanic.name} - {mechanic.specialization || 'N/A'}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Estimated Repair Time"
              value={repairTime}
              onChange={(e) => setRepairTime(e.target.value)}
              placeholder="e.g., 2 days, 1 week"
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button onClick={handleSubmitAssignment} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DamageManagement; 