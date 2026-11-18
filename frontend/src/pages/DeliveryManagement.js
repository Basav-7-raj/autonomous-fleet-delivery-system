import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import axios from 'axios'; // Import axios
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Mock data for vehicles (for demo purposes if backend data not available)
const mockVehicles = [
  { _id: '60d0fe4f3b5e4b3e8c8e1a1a', vehicleNumber: 'VH001', type: 'Standard Delivery Van' },
  { _id: '60d0fe4f3b5e4b3e8c8e1a1b', vehicleNumber: 'VH002', type: 'Refrigerated Truck' },
  { _id: '60d0fe4f3b5e4b3e8c8e1a1c', vehicleNumber: 'VH003', type: 'Hot Food Delivery Vehicle' },
];

// Mock data for drivers (for demo purposes if backend data not available)
const mockDrivers = [
  { _id: '60d0fe4f3b5e4b3e8c8e1a1d', name: 'Alice Smith' },
  { _id: '60d0fe4f3b5e4b3e8c8e1a1e', name: 'Bob Johnson' },
  { _id: '60d0fe4f3b5e4b3e8c8e1a1f', name: 'Charlie Brown' },
];

const deliveryStatuses = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const API_BASE_URL = 'https://autonomous-vehicle-lyze.onrender.com/api';

function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState([]); // Initialize as empty array
    const [openMapDialog, setOpenMapDialog] = useState(false);
    const [mapMode, setMapMode] = useState('pickup'); // 'pickup' or 'delivery'
    const [availableVehicles, setAvailableVehicles] = useState([]);
  const [vehicles, setVehicles] = useState([]); // New state for vehicles
  const [drivers, setDrivers] = useState([]);     // New state for drivers
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchData(); // Consolidated fetch function
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [deliveriesRes, vehiclesRes, driversRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/deliveries`, { headers }),
        axios.get(`${API_BASE_URL}/vehicles`, { headers }), // Fetch vehicles from backend
        axios.get(`${API_BASE_URL}/users?role=driver`, { headers }), // Fetch drivers from backend
      ]);

      setDeliveries(deliveriesRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data.filter(user => user.role === 'driver')); // Filter for drivers

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setSnackbarMessage('Failed to load data.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddDelivery = () => {
    setSelectedDelivery(null);
    setFormData({
      customerName: '',
      address: '',
      status: 'PENDING',
      vehicleId: '',
      driverId: '',
      priority: 'MEDIUM',
      estimatedDelivery: '',
    });
    setOpenDialog(true);
  };

  const handleEditDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setFormData({
      ...delivery,
      vehicleId: delivery.vehicleId?._id || '',
      driverId: delivery.driverId?._id || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteDelivery = async (deliveryId) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/deliveries/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbarMessage('Delivery deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchData(); // Re-fetch all data to update the list
    } catch (err) {
      console.error('Error deleting delivery:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete delivery.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDelivery(null);
    setFormData({});
  };


  const handleSaveDelivery = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        // Ensure vehicleId and driverId are sent as _id strings if they are objects
        vehicleId: formData.vehicleId?._id || formData.vehicleId,
        driverId: formData.driverId?._id || formData.driverId,
      };

      if (selectedDelivery) {
        // Update existing delivery
        await axios.patch(`${API_BASE_URL}/deliveries/${selectedDelivery._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbarMessage('Delivery updated successfully!');
        setSnackbarSeverity('success');
      } else {
        // Add new delivery
        await axios.post(`${API_BASE_URL}/deliveries`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSnackbarMessage('Delivery added successfully!');
        setSnackbarSeverity('success');
      }
      setSnackbarOpen(true);
      handleCloseDialog();
      fetchData(); // Re-fetch all data to update the list
    } catch (err) {
      console.error('Error saving delivery:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save delivery.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_TRANSIT':
        return 'info';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  // Fetch available vehicles when pickup location changes
  useEffect(() => {
    const fetchAvailable = async () => {
      if (!formData.pickupLocation) return;
      try {
        const token = localStorage.getItem('token');
        const { lat, lng } = formData.pickupLocation;
        const res = await axios.get(`${API_BASE_URL}/vehicles/available`, {
          params: { pickupLat: lat, pickupLng: lng },
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableVehicles(res.data || []);
      } catch (err) {
        console.warn('Failed to fetch available vehicles', err);
      }
    };
    fetchAvailable();
  }, [formData.pickupLocation]);

  function LocationSelector({ mode }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFormData(prev => ({ ...prev, [`${mode}Location`]: { lat, lng, address: '' } }));
      }
    });
    return null;
  }

  const handleOpenMapDialog = (mode) => {
    setMapMode(mode);
    setOpenMapDialog(true);
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    (delivery.deliveryId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (delivery.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Delivery Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <TextField
                label="Search Deliveries"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 300 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddDelivery}
              >
                Add Delivery
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Delivery ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Estimated Delivery</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow><TableCell colSpan={9} align="center">Loading deliveries...</TableCell></TableRow>
                )}
                {error && !snackbarOpen && (
                  <TableRow><TableCell colSpan={9} align="center"><Alert severity="error">{error}</Alert></TableCell></TableRow>
                )}
                {!loading && !error && filteredDeliveries.length === 0 && (
                  <TableRow><TableCell colSpan={9} align="center">No deliveries found. Add a new one!</TableCell></TableRow>
                )}
                {!loading && !error && filteredDeliveries.length > 0 && filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery._id}> {/* Use _id from MongoDB */}
                    <TableCell>{delivery.deliveryId}</TableCell>
                    <TableCell>{delivery.customerName}</TableCell>
                    <TableCell>{delivery.address}</TableCell>
                    <TableCell>
                      <Chip
                        label={delivery.status}
                        color={getStatusColor(delivery.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{delivery.vehicleId?.vehicleNumber || 'N/A'}</TableCell> {/* Display vehicleNumber */}
                    <TableCell>{delivery.driverId?.name || 'N/A'}</TableCell> {/* Display driver name */}
                    <TableCell>
                      <Chip
                        label={delivery.priority}
                        color={getPriorityColor(delivery.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {delivery.estimatedDelivery ? new Date(delivery.estimatedDelivery).toLocaleString() : ''}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditDelivery(delivery)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDelivery(delivery._id)} // Use _id for delete
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle>Add New Delivery</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="deliveryId"
              label="Delivery ID"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.deliveryId || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="customerName"
              label="Customer Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.customerName || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="address"
              label="Address"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.address || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="status"
              label="Status"
              select
              fullWidth
              variant="outlined"
              value={formData.status || 'PENDING'}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              {deliveryStatuses.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="vehicleId"
              label="Vehicle"
              select
              fullWidth
              variant="outlined"
              value={formData.vehicleId || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              {loading && <MenuItem disabled>Loading vehicles...</MenuItem>}
              {(availableVehicles.length > 0 ? availableVehicles : (vehicles.length > 0 ? vehicles : mockVehicles)).map((vehicle) => (
                <MenuItem key={vehicle._id || vehicle._id} value={vehicle._id || vehicle._id}>
                  {vehicle.vehicleNumber ? `${vehicle.vehicleNumber} (${vehicle.type})` : `${vehicle.vehicleNumber || vehicle.vehicleNumber} (${vehicle.type || vehicle.type})`} 
                  {vehicle.cost ? ` — $${vehicle.cost} • ETA ${vehicle.etaMinutes}m` : ''}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="outlined" onClick={() => handleOpenMapDialog('pickup')}>Pick Pickup on Map</Button>
              <Button variant="outlined" onClick={() => handleOpenMapDialog('delivery')}>Pick Delivery on Map</Button>
              <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="caption">Pickup: {formData.pickupLocation ? `${formData.pickupLocation.lat.toFixed(4)}, ${formData.pickupLocation.lng.toFixed(4)}` : '—'}</Typography>
                <Typography variant="caption">Delivery: {formData.deliveryLocation ? `${formData.deliveryLocation.lat.toFixed(4)}, ${formData.deliveryLocation.lng.toFixed(4)}` : '—'}</Typography>
              </Box>
            </Box>
            <TextField
              margin="dense"
              name="driverId"
              label="Driver"
              select
              fullWidth
              variant="outlined"
              value={formData.driverId || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              {loading && <MenuItem disabled>Loading drivers...</MenuItem>}
              {(drivers.length > 0 ? drivers : mockDrivers).map((driver) => (
                <MenuItem key={driver._id} value={driver._id}>
                  {driver.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="priority"
              label="Priority"
              select
              fullWidth
              variant="outlined"
              value={formData.priority || 'MEDIUM'}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              {priorities.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="estimatedDelivery"
              label="Estimated Delivery (YYYY-MM-DDTHH:MM)"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={formData.estimatedDelivery || ''}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 2 }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveDelivery} variant="contained" color="primary">
              {selectedDelivery ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Map Dialog for selecting pickup/delivery locations */}
        <Dialog open={openMapDialog} onClose={() => setOpenMapDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Select location on map</DialogTitle>
          <DialogContent>
            <Box sx={{ height: 400, width: '100%' }}>
              <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector mode={mapMode} />
                {formData[`${mapMode}Location`] && (
                  <Marker position={[formData[`${mapMode}Location`].lat, formData[`${mapMode}Location`].lng]} />
                )}
              </MapContainer>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMapDialog(false)}>Done</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </Box>
  );
}

export default DeliveryManagement; 