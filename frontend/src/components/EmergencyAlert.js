import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Warning as WarningIcon,
  NotificationsActive as AlertIcon,
  Camera as CameraIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as MedicalIcon,
  Security as SecurityIcon,
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AddEmergencyVehicle from './AddEmergencyVehicle';

// Initialize socket connection
const socket = io('https://autonomous-vehicle-lyze.onrender.com', { transports: ['websocket', 'polling'] });

// Mock data for emergency alerts with more realistic scenarios
const mockAlerts = [
  {
    id: 'mock-alert-1',
    vehicleId: 'VH789',
    timestamp: new Date().toISOString(),
    type: 'ACCIDENT',
    severity: 'HIGH',
    status: 'ACTIVE',
    location: 'Highway 101',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    capturedImages: ['/car.webp'],
    description: 'Vehicle involved in a multi-car collision. Immediate response required.',
    vehicleType: 'Heavy Duty Truck',
    batteryLevel: 75,
    speed: 0,
    driver: {
      name: 'John Doe',
      contact: '+1-555-12345',
      license: 'DL1234567'
    },
    responders: [{ id: 1, name: 'Response Team A', type: 'Emergency', status: 'En Route' }]
  },
  {
    id: 'mock-alert-2',
    vehicleId: 'VH456',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    type: 'SECURITY',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    location: 'Industrial Zone',
    coordinates: { lat: 34.0600, lng: -118.2500 },
    capturedImages: ['/thief.webp'],
    description: 'Suspicious activity detected near warehouse. Security team dispatched.',
    vehicleType: 'Security Patrol Vehicle',
    batteryLevel: 90,
    speed: 10,
    driver: {
      name: 'Jane Smith',
      contact: '+1-555-98765',
      license: 'DL9876543'
    },
    responders: [{ id: 2, name: 'Security Unit B', type: 'Security', status: 'En Route' }]
  },
  {
    id: 'mock-alert-3',
    vehicleId: 'VH123',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    type: 'BREAKDOWN',
    severity: 'LOW',
    status: 'ACTIVE',
    location: 'Residential District',
    coordinates: { lat: 34.0700, lng: -118.2600 },
    capturedImages: ['/car2.jpg'],
    description: 'Vehicle experienced an engine breakdown. Tow truck on the way.',
    vehicleType: 'Standard Delivery Van',
    batteryLevel: 60,
    speed: 0,
    driver: {
      name: 'Mike Johnson',
      contact: '+1-555-45678',
      license: 'DL4567890'
    },
    responders: [{ id: 3, name: 'Maintenance Team C', type: 'Maintenance', status: 'En Route' }]
  }
];

function EmergencyAlert() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [responseTime, setResponseTime] = useState(0);
  const [openAddVehicle, setOpenAddVehicle] = useState(false);

  // Fetch initial alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get(`https://autonomous-vehicle-lyze.onrender.com/api/emergency-alerts/active`);
        console.log('API Response for active alerts:', response.data);
        if (response.data && response.data.length > 0) {
          setAlerts(response.data);
        } else {
          console.log('No active alerts from API, using mock data.');
          setAlerts(mockAlerts);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setSnackbar({
          open: true,
          message: 'Error fetching alerts',
          severity: 'error'
        });
      }
    };

    fetchAlerts();
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    socket.on('alert', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      setSnackbar({
        open: true,
        message: `New ${newAlert.type} alert detected for vehicle ${newAlert.vehicleId}!`,
        severity: 'error'
      });
    });

    return () => {
      socket.off('alert');
    };
  }, []);

  // Simulate real-time monitoring
  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(() => {
        // Simulate random alerts
        if (Math.random() < 0.1) { // 10% chance of new alert
          const alertTypes = ['ACCIDENT', 'BREAKDOWN', 'MEDICAL', 'SECURITY'];
          const severities = ['LOW', 'MEDIUM', 'HIGH'];
          const locations = [
            'Downtown Area',
            'Industrial Zone',
            'Residential District',
            'Highway 101',
            'City Center'
          ];
          
          // Randomly select an image from available ones
          const availableImages = ['/car.webp', '/thief.webp', '/car2.jpg'];
          const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
          
          const newAlert = {
            vehicleId: `VH${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString(),
            type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: 'ACTIVE',
            location: locations[Math.floor(Math.random() * locations.length)],
            coordinates: {
              lat: 40.7128 + (Math.random() - 0.5) * 0.1,
              lng: -74.0060 + (Math.random() - 0.5) * 0.1
            },
            capturedImages: [randomImage],
            description: 'Emergency situation detected. Response team dispatched.',
            vehicleType: 'Standard Delivery Van',
            batteryLevel: Math.floor(Math.random() * 100),
            speed: Math.floor(Math.random() * 60),
            driver: {
              name: 'Driver ' + Math.floor(Math.random() * 1000),
              contact: '+1-555-' + Math.floor(Math.random() * 10000),
              license: 'DL' + Math.floor(Math.random() * 1000000)
            },
            responders: [
              {
                id: Math.floor(Math.random() * 1000),
                name: 'Response Team ' + Math.floor(Math.random() * 10),
                type: 'Emergency',
                status: 'En Route'
              }
            ]
          };

          // Save alert to database
          axios.post(`https://autonomous-vehicle-lyze.onrender.com/api/emergency-alerts`, newAlert)
            .then(response => {
              socket.emit('emergencyAlert', response.data);
            })
            .catch(error => {
              console.error('Error saving alert:', error);
              setSnackbar({
                open: true,
                message: 'Error saving alert',
                severity: 'error'
              });
            });
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Simulate response time tracking
  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(() => {
        setResponseTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    setResponseTime(0);
    setSnackbar({
      open: true,
      message: 'Emergency monitoring system activated',
      severity: 'success'
    });
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    setSnackbar({
      open: true,
      message: 'Emergency monitoring system deactivated',
      severity: 'info'
    });
  };

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAlert(null);
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await axios.patch(`https://autonomous-vehicle-lyze.onrender.com/api/emergency-alerts/${alertId}/resolve`);
      setAlerts(prev =>
        prev.map(alert =>
          alert._id === alertId
            ? { ...alert, status: 'RESOLVED' }
            : alert
        )
      );
      setSnackbar({
        open: true,
        message: 'Alert marked as resolved',
        severity: 'success'
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Error resolving alert:', error);
      setSnackbar({
        open: true,
        message: 'Error resolving alert',
        severity: 'error'
      });
    }
  };

  const handleAddVehicleSuccess = (newVehicle) => {
    setSnackbar({
      open: true,
      message: 'Emergency vehicle added successfully',
      severity: 'success'
    });
    setOpenAddVehicle(false);
  };

  const handleAddDemoVehicle = () => {
    const alertTypes = ['ACCIDENT', 'BREAKDOWN', 'MEDICAL', 'SECURITY'];
    const severities = ['LOW', 'MEDIUM', 'HIGH'];
    const locations = [
      'Downtown Area',
      'Industrial Zone',
      'Residential District',
      'Highway 101',
      'City Center'
    ];
    const availableImages = ['/car.webp', '/thief.webp', '/car2.jpg'];

    const newDemoAlert = {
      id: `mock-alert-${Date.now()}`,
      vehicleId: `VH${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: 'ACTIVE',
      location: locations[Math.floor(Math.random() * locations.length)],
      coordinates: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1
      },
      capturedImages: [availableImages[Math.floor(Math.random() * availableImages.length)]],
      description: 'Simulated emergency situation. For demo purposes only.',
      vehicleType: 'Demo Vehicle',
      batteryLevel: Math.floor(Math.random() * 100),
      speed: Math.floor(Math.random() * 60),
      driver: {
        name: 'Demo Driver ' + Math.floor(Math.random() * 100),
        contact: '+1-555-' + Math.floor(Math.random() * 10000),
        license: 'DL' + Math.floor(Math.random() * 1000000)
      },
      responders: [
        {
          id: Math.floor(Math.random() * 1000),
          name: 'Demo Response Team ' + Math.floor(Math.random() * 10),
          type: 'Emergency',
          status: 'En Route'
        }
      ]
    };
    setAlerts(prev => [newDemoAlert, ...prev]);
    setSnackbar({
      open: true,
      message: 'New demo vehicle added!',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getAlertColor = (type) => {
    const colors = {
      ACCIDENT: 'error',
      BREAKDOWN: 'warning',
      MEDICAL: 'error',
      SECURITY: 'error',
    };
    return colors[type] || 'default';
  };

  const getAlertIcon = (type) => {
    const icons = {
      ACCIDENT: <CarIcon />,
      BREAKDOWN: <BuildIcon />,
      MEDICAL: <MedicalIcon />,
      SECURITY: <SecurityIcon />,
    };
    return icons[type] || <WarningIcon />;
  };

  const formatResponseTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Emergency Alert System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMonitoring && (
            <Typography variant="body1" color="error">
              Response Time: {formatResponseTime(responseTime)}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddVehicle(true)}
          >
            Add Emergency Vehicle
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddDemoVehicle}
            sx={{ ml: 2 }}
          >
            Add Demo Vehicle
          </Button>
          <Button
            variant="contained"
            color={isMonitoring ? 'error' : 'primary'}
            onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
            startIcon={isMonitoring ? <StopIcon /> : <PlayIcon />}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </Box>
      </Box>

      {isMonitoring && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress color="error" />
        </Box>
      )}

      <Grid container spacing={3}>
        {alerts.map((alert) => (
          <Grid item xs={12} md={6} key={alert.id}>
            <Card 
              sx={{ 
                borderLeft: 6, 
                borderColor: getAlertColor(alert.type),
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getAlertIcon(alert.type)}
                    <Typography variant="h6">
                      Vehicle {alert.vehicleId}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={alert.type}
                      color={getAlertColor(alert.type)}
                      size="small"
                    />
                    <Chip
                      label={alert.severity}
                      color={alert.severity === 'HIGH' ? 'error' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon fontSize="small" />
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" />
                    {alert.location}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    {alert.driver.name}
                  </Typography>
                </Box>

                {alert.capturedImages.map((image, index) => (
                  <CardMedia
                    key={index}
                    component="img"
                    height="140"
                    image={image}
                    alt={`Alert ${index + 1}`}
                    sx={{ borderRadius: 1, mb: 2 }}
                  />
                ))}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {alert.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AlertIcon />}
                    onClick={() => handleViewAlert(alert)}
                  >
                    View Details
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Battery: {alert.batteryLevel}% | Speed: {alert.speed} km/h
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Alert Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Alert Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Vehicle {selectedAlert.vehicleId}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={selectedAlert.type}
                        color={getAlertColor(selectedAlert.type)}
                      />
                      <Chip
                        label={selectedAlert.severity}
                        color={selectedAlert.severity === 'HIGH' ? 'error' : 'warning'}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Vehicle Information</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CarIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Type" 
                          secondary={selectedAlert.vehicleType} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Location" 
                          secondary={selectedAlert.location} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><TimeIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Time" 
                          secondary={new Date(selectedAlert.timestamp).toLocaleString()} 
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Driver Information</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Name" 
                          secondary={selectedAlert.driver.name} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Contact" 
                          secondary={selectedAlert.driver.contact} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText 
                          primary="License" 
                          secondary={selectedAlert.driver.license} 
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Response Team</Typography>
                    <List>
                      {selectedAlert.responders.map((responder) => (
                        <ListItem key={responder.id}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: responder.type === 'Medical' ? 'error.main' : 'primary.main' }}>
                              {responder.type === 'Medical' ? <MedicalIcon /> : <SecurityIcon />}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={responder.name}
                            secondary={`${responder.type} - ${responder.status}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Captured Images</Typography>
                  <Grid container spacing={2}>
                    {selectedAlert.capturedImages.map((image, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={image}
                          alt={`Alert Image ${index + 1}`}
                          sx={{ borderRadius: 1 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedAlert?.status === 'ACTIVE' && (
            <Button
              onClick={() => handleResolveAlert(selectedAlert.id)}
              variant="contained"
              color="success"
            >
              Mark as Resolved
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <AddEmergencyVehicle
        open={openAddVehicle}
        onClose={() => setOpenAddVehicle(false)}
        onSuccess={handleAddVehicleSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EmergencyAlert; 