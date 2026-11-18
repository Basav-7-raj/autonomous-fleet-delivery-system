import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Chip,
  Divider,
  Fade,
  Zoom,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  DirectionsCar as VehicleIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const deliverySteps = ['Ordered', 'Picked Up', 'In Transit', 'Delivered'];

// Custom styles
const styles = {
  card: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    },
  },
  statusChip: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    '& .MuiLinearProgress-bar': {
      borderRadius: 4,
      transition: 'transform 0.4s ease',
    },
  },
};

function DeliveryTracking() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [socket, setSocket] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);
  const [fleetLocations, setFleetLocations] = useState([]);
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  // Add default map center
  const defaultMapCenter = [51.505, -0.09]; // Default to London coordinates

  // Helper function to check if location is valid
  const isValidLocation = (location) => {
    return location && typeof location.lat === 'number' && typeof location.lng === 'number';
  };

  // Get map center based on delivery locations
  const getMapCenter = (delivery) => {
    if (!delivery) return defaultMapCenter;
    
    if (isValidLocation(delivery.currentLocation)) {
      return [delivery.currentLocation.lat, delivery.currentLocation.lng];
    }
    if (isValidLocation(delivery.pickupLocation)) {
      return [delivery.pickupLocation.lat, delivery.pickupLocation.lng];
    }
    if (isValidLocation(delivery.deliveryLocation)) {
      return [delivery.deliveryLocation.lat, delivery.deliveryLocation.lng];
    }
    
    return defaultMapCenter;
  };

  // Update map center when delivery is selected
  useEffect(() => {
    if (selectedDelivery) {
      setMapCenter(getMapCenter(selectedDelivery));
    }
  }, [selectedDelivery]);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('https://autonomous-vehicle-lyze.onrender.com');
    setSocket(newSocket);

    newSocket.on('deliveryUpdate', (updatedDelivery) => {
      setDeliveries(prevDeliveries =>
        prevDeliveries.map(del =>
          del._id === updatedDelivery._id ? updatedDelivery : del
        )
      );
      if (selectedDelivery?._id === updatedDelivery._id) {
        setSelectedDelivery(updatedDelivery);
      }
    });

    return () => newSocket.close();
  }, []);

  // Calculate estimated time remaining
  useEffect(() => {
    if (selectedDelivery) {
      const updateEstimatedTime = () => {
        const now = new Date();
        const estimatedDelivery = new Date(selectedDelivery.estimatedDelivery);
        const timeRemaining = estimatedDelivery - now;
        
        if (timeRemaining > 0) {
          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          setEstimatedTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setEstimatedTimeRemaining('Overdue');
        }
      };

      updateEstimatedTime();
      const interval = setInterval(updateEstimatedTime, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [selectedDelivery]);

  // Calculate delivery progress percentage
  const calculateProgress = (status) => {
    const stepIndex = deliverySteps.indexOf(status);
    return ((stepIndex + 1) / deliverySteps.length) * 100;
  };

  // Fetch deliveries from backend
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/deliveries', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDeliveries(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching deliveries:', err);
        setError('Failed to fetch deliveries. Please try again later.');
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  useEffect(() => {
    if (selectedDelivery) {
      setNewStatus(selectedDelivery.status); // Set initial status for dropdown
    }
  }, [selectedDelivery]);

  // Fetch fleet and delivery locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Demo fleet locations
        const demoFleetData = [
          {
            id: '1',
            location: '123 Main Street, New York, NY',
            type: 'Truck',
            vehicleNumber: 'TRK-001'
          },
          {
            id: '2',
            location: '456 Park Avenue, Boston, MA',
            type: 'Van',
            vehicleNumber: 'VAN-002'
          },
          {
            id: '3',
            location: '789 Market Street, San Francisco, CA',
            type: 'Truck',
            vehicleNumber: 'TRK-003'
          }
        ];
        setFleetLocations(demoFleetData);

        // Demo delivery locations
        const demoDeliveryData = [
          {
            id: '1',
            pickupLocation: '100 Broadway, New York, NY',
            deliveryLocation: '200 5th Avenue, New York, NY',
            status: 'In Transit'
          },
          {
            id: '2',
            pickupLocation: '300 Boylston Street, Boston, MA',
            deliveryLocation: '400 Commonwealth Avenue, Boston, MA',
            status: 'Delivered'
          },
          {
            id: '3',
            pickupLocation: '500 Mission Street, San Francisco, CA',
            deliveryLocation: '600 Market Street, San Francisco, CA',
            status: 'Pending'
          }
        ];
        setDeliveryLocations(demoDeliveryData);

        // Try to fetch real data if available
        try {
          const fleetResponse = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/vehicles', { headers });
          const fleetData = fleetResponse.data.map(vehicle => ({
            id: vehicle._id,
            location: vehicle.currentLocation,
            type: vehicle.type,
            vehicleNumber: vehicle.vehicleNumber
          }));
          setFleetLocations(fleetData);

          const deliveryResponse = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/deliveries', { headers });
          const deliveryData = deliveryResponse.data.map(delivery => ({
            id: delivery._id,
            pickupLocation: delivery.pickupLocation,
            deliveryLocation: delivery.deliveryLocation,
            status: delivery.status
          }));
          setDeliveryLocations(deliveryData);
        } catch (error) {
          console.log('Using demo data as API is not available');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch location data',
          severity: 'error'
        });
      }
    };

    fetchLocations();
  }, []);

  // Helper functions to get locations
  const getVehicleLocation = (vehicleId) => {
    const vehicle = fleetLocations.find(v => v.id === vehicleId);
    return vehicle?.location || null;
  };

  const getDeliveryLocations = (deliveryId) => {
    const delivery = deliveryLocations.find(d => d.id === deliveryId);
    return {
      pickup: delivery?.pickupLocation || null,
      delivery: delivery?.deliveryLocation || null
    };
  };

  const handleDeliverySelect = (delivery) => {
    setSelectedDelivery(delivery);
  };

  const handleOpenMap = () => {
    setOpenMapDialog(true);
  };

  const handleCloseMap = () => {
    setOpenMapDialog(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDelivery || !newStatus) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        return;
      }

      const response = await axios.patch(
        `https://autonomous-vehicle-lyze.onrender.com/api/deliveries/${selectedDelivery._id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeliveries(prevDeliveries =>
        prevDeliveries.map(del =>
          del._id === response.data._id ? response.data : del
        )
      );
      setSelectedDelivery(response.data); // Update selected delivery with fresh data
      setSnackbar({ open: true, message: 'Delivery status updated successfully!', severity: 'success' });
    } catch (err) {
      console.error('Error updating delivery status:', err);
      setSnackbar({ open: true, message: 'Failed to update delivery status.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ordered':
        return '#2196f3';
      case 'Picked Up':
        return '#ff9800';
      case 'In Transit':
        return '#9c27b0';
      case 'Delivered':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  // Update the delivery card to show location information
  const renderDeliveryCard = (delivery) => {
    const vehicleLocation = getVehicleLocation(delivery.vehicleId);
    const deliveryLocations = getDeliveryLocations(delivery._id);

    return (
      <Fade in={true} key={delivery._id}>
        <Card
          sx={{
            ...styles.card,
            backgroundColor: selectedDelivery?._id === delivery._id ? 'primary.light' : 'background.paper',
            borderRadius: 2,
          }}
          onClick={() => handleDeliverySelect(delivery)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {delivery.deliveryId}
              </Typography>
              <Chip
                label={delivery.status}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(delivery.status),
                  color: 'white',
                  ...styles.statusChip,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <VehicleIcon fontSize="small" color="primary" />
              <Typography color="text.secondary">
                {delivery.vehicleId?.vehicleNumber || 'N/A'} ({delivery.vehicleId?.type || 'N/A'})
              </Typography>
            </Box>
            {vehicleLocation && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationIcon fontSize="small" color="primary" />
                <Typography color="text.secondary">
                  Vehicle Location: {vehicleLocation}
                </Typography>
              </Box>
            )}
            {deliveryLocations.pickup && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationIcon fontSize="small" color="primary" />
                <Typography color="text.secondary">
                  Pickup: {deliveryLocations.pickup}
                </Typography>
              </Box>
            )}
            <LinearProgress
              variant="determinate"
              value={calculateProgress(delivery.status)}
              sx={{
                ...styles.progressBar,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getStatusColor(delivery.status),
                },
              }}
            />
          </CardContent>
        </Card>
      </Fade>
    );
  };

  // Update the delivery details section
  const renderDeliveryDetails = () => {
    if (!selectedDelivery) return null;

    const vehicleLocation = getVehicleLocation(selectedDelivery.vehicleId);
    const deliveryLocations = getDeliveryLocations(selectedDelivery._id);

    return (
      <Zoom in={true}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#F3F5F9' }}>
            Delivery Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stepper
                activeStep={deliverySteps.indexOf(selectedDelivery.status)}
                alternativeLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: 'bold',
                  },
                  '& .MuiStepIcon-root': {
                    color: getStatusColor(selectedDelivery.status),
                  },
                  '& .MuiStepConnector-line': {
                    borderColor: getStatusColor(selectedDelivery.status),
                  },
                }}
              >
                {deliverySteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="primary" />
                    Locations
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {getVehicleLocation(selectedDelivery.vehicleId) && (
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                          transform: 'translateX(4px)',
                        }
                      }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                          Vehicle Location
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                          {getVehicleLocation(selectedDelivery.vehicleId)}
                        </Typography>
                      </Box>
                    )}
                    {deliveryLocations.pickup && (
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                          transform: 'translateX(4px)',
                        }
                      }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>Pickup</Typography>
                        <Typography sx={{ mt: 1 }}>
                          {selectedDelivery.pickupLocation ?
                            `${selectedDelivery.pickupLocation.lat.toFixed(4)}, ${selectedDelivery.pickupLocation.lng.toFixed(4)}` :
                            'Location not available'}
                        </Typography>
                      </Box>
                    )}
                    {deliveryLocations.delivery && (
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(76, 175, 80, 0.2)',
                          transform: 'translateX(4px)',
                        }
                      }}>
                        <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'bold' }}>Delivery</Typography>
                        <Typography sx={{ mt: 1 }}>
                          {selectedDelivery.deliveryLocation ?
                            `${selectedDelivery.deliveryLocation.lat.toFixed(4)}, ${selectedDelivery.deliveryLocation.lng.toFixed(4)}` :
                            'Location not available'}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(156, 39, 176, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.2)',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 'bold' }}>Current</Typography>
                      <Typography sx={{ mt: 1 }}>
                        {selectedDelivery.currentLocation ?
                          `${selectedDelivery.currentLocation.lat.toFixed(4)}, ${selectedDelivery.currentLocation.lng.toFixed(4)}` :
                          'Location not available'}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenMap}
                    sx={{ 
                      mt: 2, 
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      }
                    }}
                    disabled={!isValidLocation(selectedDelivery.pickupLocation) &&
                      !isValidLocation(selectedDelivery.deliveryLocation) &&
                      !isValidLocation(selectedDelivery.currentLocation)}
                    startIcon={<LocationIcon />}
                  >
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon color="primary" />
                    Time Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 'bold' }}>Estimated Delivery</Typography>
                      <Typography sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" />
                        {new Date(selectedDelivery.estimatedDelivery).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 'bold' }}>Time Remaining</Typography>
                      <Typography sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimerIcon color="error" fontSize="small" />
                        {estimatedTimeRemaining}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>Progress</Typography>
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateProgress(selectedDelivery.status)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              backgroundColor: getStatusColor(selectedDelivery.status),
                              transition: 'transform 0.4s ease',
                            },
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mt: 1,
                            color: getStatusColor(selectedDelivery.status),
                            fontWeight: 'bold',
                            textAlign: 'center'
                          }}
                        >
                          {Math.round(calculateProgress(selectedDelivery.status))}% Complete
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon color="primary" />
                    Update Status
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>New Status</InputLabel>
                    <Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      label="New Status"
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: getStatusColor(newStatus || selectedDelivery.status),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: getStatusColor(newStatus || selectedDelivery.status),
                        },
                      }}
                    >
                      {deliverySteps.map((status) => (
                        <MenuItem 
                          key={status} 
                          value={status}
                          sx={{
                            color: getStatusColor(status),
                            '&.Mui-selected': {
                              backgroundColor: `${getStatusColor(status)}20`,
                            },
                          }}
                        >
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || newStatus === selectedDelivery.status}
                    sx={{ 
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      }
                    }}
                    startIcon={<SpeedIcon />}
                  >
                    Update Status
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Zoom>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h5">Loading Deliveries...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h5" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    
    <Box sx={{ p: 3, backgroundColor: '#2E2E2E', minHeight: '100vh' }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F3F5F9' }}>
          Delivery Tracking
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh Deliveries">
            <IconButton color="primary" onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton color="primary">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(30, 30, 30, 0.85)',
          borderRadius: 3,
          boxShadow: 4,
          p: 3,
        }}
      >
        
        <video
          width="99%"
          style={{
            maxWidth: 1500,
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            outline: '2px solid #595E60',
            background: '#111',
            cursor: 'pointer',
          }}
          src="/R2-On-road_L_compressed_2.mp4"
          type="video/mp4"
          muted
          onMouseEnter={e => e.target.play()}
          // onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
          tabIndex={-1} // Prevents accidental focus
        >
          Your browser does not support the video tag.
        </video>
      </Box>
     


      

      <Grid container spacing={3}>
        {/* Delivery List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                fullWidth
                label="Search Deliveries"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((delivery) => {
                  const vehicleLocation = getVehicleLocation(delivery.vehicleId);
                  const deliveryLocations = getDeliveryLocations(delivery._id);

                  return (
                    <Fade in={true} key={delivery._id}>
                      <Card
                        sx={{
                          ...styles.card,
                          backgroundColor: selectedDelivery?._id === delivery._id ? 'primary.light' : 'background.paper',
                          borderRadius: 2,
                        }}
                        onClick={() => handleDeliverySelect(delivery)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {delivery.deliveryId}
                            </Typography>
                            <Chip
                              label={delivery.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(delivery.status),
                                color: 'white',
                                ...styles.statusChip,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <VehicleIcon fontSize="small" color="primary" />
                            <Typography color="text.secondary">
                              {delivery.vehicleId?.vehicleNumber || 'N/A'} ({delivery.vehicleId?.type || 'N/A'})
                            </Typography>
                          </Box>
                          {vehicleLocation && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationIcon fontSize="small" color="primary" />
                              <Typography color="text.secondary">
                                Vehicle Location: {vehicleLocation}
                              </Typography>
                            </Box>
                          )}
                          {deliveryLocations.pickup && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationIcon fontSize="small" color="primary" />
                              <Typography color="text.secondary">
                                Pickup: {deliveryLocations.pickup}
                              </Typography>
                            </Box>
                          )}
                          <LinearProgress
                            variant="determinate"
                            value={calculateProgress(delivery.status)}
                            sx={{
                              ...styles.progressBar,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getStatusColor(delivery.status),
                              },
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Fade>
                  );
                })
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  No deliveries found
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Delivery Details */}
        <Grid item xs={12} md={8}>
          {selectedDelivery ? (
            renderDeliveryDetails()
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" color="text.secondary">
                Select a delivery to view details
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Map Dialog */}
      <Dialog
        open={openMapDialog}
        onClose={handleCloseMap}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Delivery Location
          <IconButton
            aria-label="close"
            onClick={handleCloseMap}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, width: '100%' }}>
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {selectedDelivery && (
                <>
                  {isValidLocation(selectedDelivery.pickupLocation) && (
                    <Marker position={[selectedDelivery.pickupLocation.lat, selectedDelivery.pickupLocation.lng]}>
                      <Popup>Pickup Location</Popup>
                    </Marker>
                  )}
                  {isValidLocation(selectedDelivery.deliveryLocation) && (
                    <Marker position={[selectedDelivery.deliveryLocation.lat, selectedDelivery.deliveryLocation.lng]}>
                      <Popup>Delivery Location</Popup>
                    </Marker>
                  )}
                  {isValidLocation(selectedDelivery.currentLocation) && (
                    <Marker position={[selectedDelivery.currentLocation.lat, selectedDelivery.currentLocation.lng]}>
                      <Popup>Current Location</Popup>
                    </Marker>
                  )}
                </>
              )}
            </MapContainer>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>

    
  );
}

export default DeliveryTracking; 