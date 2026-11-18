import React, { useState, useEffect } from 'react';
import AIInsightsPanel from '../components/AIInsightsPanel';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Button,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  DirectionsCar as VehicleIcon,
  LocalShipping as DeliveryIcon,
  BatteryChargingFull as BatteryIcon,
  Speed as SpeedIcon,
  MoreVert as MoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';  // charts banane ke liye use hota hai.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PredictiveMaintenance from '../components/PredictiveMaintenance';
import axios from 'axios';
import VoiceAssistant from '../components/VoiceAssistant';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function StatCard({ title, value, icon, color, trend, onViewDetails }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                if (onViewDetails) onViewDetails();
              }}
            >
              View Details
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
          </Menu>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="body2"
            color={trend > 0 ? 'success.main' : 'error.main'}
          >
            {trend > 0 ? '+' : ''}{trend}% from last week
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'Vehicle #123 needs maintenance',
      time: '5 minutes ago',
    },
    {
      id: 2,
      type: 'error',
      message: 'Delivery #456 delayed',
      time: '10 minutes ago',
    },
  ]);

  const [performanceData, setPerformanceData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Deliveries',
        data: [12, 19, 15, 17, 22, 25, 20],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [deliveryError, setDeliveryError] = useState(null);

  const [damagedVehicles, setDamagedVehicles] = useState([]);
  const [loadingDamaged, setLoadingDamaged] = useState(true);
  const [damagedError, setDamagedError] = useState(null);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogTitle, setDetailsDialogTitle] = useState('');
  const [detailsDialogContent, setDetailsDialogContent] = useState([]);

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehiclesError, setVehiclesError] = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setDeliveryError('Authentication token not found. Please log in.');
          setLoadingDeliveries(false);
          return;
        }
        const response = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/deliveries', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeliveries(response.data);
        setLoadingDeliveries(false);
      } catch (err) {
        setDeliveryError('Failed to fetch deliveries.');
        setLoadingDeliveries(false);
      }
    };
    fetchDeliveries();
  }, []);

  useEffect(() => {
    const fetchDamagedVehicles = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setDamagedError('Authentication token not found. Please log in.');
          setLoadingDamaged(false);
          return;
        }
        const response = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/damage', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDamagedVehicles(response.data);
        setLoadingDamaged(false);
      } catch (err) {
        setDamagedError('Failed to fetch damaged vehicles.');
        setLoadingDamaged(false);
      }
    };
    fetchDamagedVehicles();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(response.data);
        setLoadingVehicles(false);
      } catch (err) {
        setVehiclesError('Failed to fetch vehicles.');
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  // Calculate counts
  const inTransitCount = deliveries.filter(d => d.status === 'IN_TRANSIT').length;
  const assignedCount = deliveries.filter(d => d.status === 'ASSIGNED').length;
  const pendingCount = deliveries.filter(d => d.status === 'PENDING').length;

  // Calculate real-time active vehicles from vehicles API
  const activeVehicleCount = vehicles.filter(v => v.status === 'active').length;

  // Calculate active deliveries
  const activeDeliveriesCount = deliveries.filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length;

  // Calculate average battery level for active vehicles
  const activeVehiclesWithBattery = deliveries
    .filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED' && d.vehicleId && typeof d.vehicleId.batteryLevel === 'number');
  const avgBatteryLevel = activeVehiclesWithBattery.length > 0
    ? Math.round(activeVehiclesWithBattery.reduce((sum, d) => sum + d.vehicleId.batteryLevel, 0) / activeVehiclesWithBattery.length)
    : 'N/A';

  // Calculate average speed for active vehicles
  const activeVehiclesWithSpeed = deliveries
    .filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED' && d.vehicleId && typeof d.vehicleId.speed === 'number');
  const avgSpeed = activeVehiclesWithSpeed.length > 0
    ? Math.round(activeVehiclesWithSpeed.reduce((sum, d) => sum + d.vehicleId.speed, 0) / activeVehiclesWithSpeed.length)
    : 'N/A';

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Performance',
      },
    },
  };

  // Handler to open details dialog with relevant data
  const handleViewDetails = (cardType) => {
    let title = '';
    let content = [];
    switch (cardType) {
      case 'activeVehicles':
        title = 'Active Vehicles';
        content = vehicles
          .filter(v => v.status === 'active')
          .map(v => `${v.vehicleNumber || 'N/A'} (${v.type || 'N/A'}) - Status: ${v.status}`);
        if (content.length === 0) content = ['No active vehicles found.'];
        break;
      case 'inTransitVehicles':
        title = 'In Transit Vehicles';
        // Find all vehicles assigned to deliveries with status IN_TRANSIT
        const inTransitDeliveries = deliveries.filter(d => d.status === 'IN_TRANSIT' && d.vehicleId);
        content = inTransitDeliveries.map(d =>
          `Delivery: ${d.deliveryId || d._id} | Vehicle: ${d.vehicleId?.vehicleNumber || 'N/A'} (${d.vehicleId?.type || 'N/A'}) | Customer: ${d.customerName || 'N/A'} | Status: IN_TRANSIT`
        );
        if (content.length === 0) content = ['No in transit vehicles found.'];
        break;
      case 'assignedVehicles':
        title = 'Assigned Vehicles';
        // Find all vehicles assigned to deliveries with status ASSIGNED
        const assignedDeliveries = deliveries.filter(d => d.status === 'ASSIGNED' && d.vehicleId);
        content = assignedDeliveries.map(d =>
          `Delivery: ${d.deliveryId || d._id} | Vehicle: ${d.vehicleId?.vehicleNumber || 'N/A'} (${d.vehicleId?.type || 'N/A'}) | Customer: ${d.customerName || 'N/A'} | Status: ASSIGNED`
        );
        if (content.length === 0) content = ['No assigned vehicles found.'];
        break;
      case 'pendingVehicles':
        title = 'Pending Vehicles';
        // Find all vehicles assigned to deliveries with status PENDING
        const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING' && d.vehicleId);
        content = pendingDeliveries.map(d =>
          `Delivery: ${d.deliveryId || d._id} | Vehicle: ${d.vehicleId?.vehicleNumber || 'N/A'} (${d.vehicleId?.type || 'N/A'}) | Customer: ${d.customerName || 'N/A'} | Status: PENDING`
        );
        if (content.length === 0) content = ['No pending vehicles found.'];
        break;
      case 'activeDeliveries':
        title = 'Active Deliveries';
        content = deliveries
          .filter(d => d.status !== 'DELIVERED' && d.status !== 'CANCELLED')
          .map(d => `${d.deliveryId || d._id} - ${d.customerName || 'N/A'} - Status: ${d.status}`);
        if (content.length === 0) content = ['No active deliveries found.'];
        break;
      case 'damagedVehicles':
        title = 'Damaged Vehicles';
        content = damagedVehicles.map(d =>
          `Vehicle: ${d.vehicleId?.vehicleNumber || d.vehicleId || 'N/A'}${d.vehicleId?.type ? ' (' + d.vehicleId.type + ')' : ''} | Location: ${d.location || 'N/A'}`
        );
        if (content.length === 0) content = ['No damaged vehicles found.'];
        break;
      case 'avgBattery':
        title = 'Average Battery Level';
        content = vehicles
          .filter(v => v.status === 'active' && typeof v.batteryLevel === 'number')
          .map(v => `${v.vehicleNumber || 'N/A'}: ${v.batteryLevel}%`);
        if (content.length === 0) content = ['No battery data available.'];
        break;
      case 'avgSpeed':
        title = 'Average Speed';
        content = vehicles
          .filter(v => v.status === 'active' && typeof v.speed === 'number')
          .map(v => `${v.vehicleNumber || 'N/A'}: ${v.speed} km/h`);
        if (content.length === 0) content = ['No speed data available.'];
        break;
      default:
        title = 'Details';
        content = ['No details available.'];
    }
    setDetailsDialogTitle(title);
    setDetailsDialogContent(content);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };

  // Fleet status calculations
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'active').length;
  const inTransitVehicles = vehicles.filter(v => v.status === 'in_transit').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const percent = (count) => totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;

  // Recent deliveries (latest 3 by estimatedDelivery or updatedAt)
  const recentDeliveries = deliveries
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.estimatedDelivery) - new Date(a.updatedAt || a.estimatedDelivery))
    .slice(0, 3);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Main Dashboard Content */}
      <div>
        <Box sx={{ flexGrow: 1 }}>
          <VoiceAssistant 
            activeVehicleCount={activeVehicleCount}
            damagedVehicleCount={damagedVehicles.length}
            avgBatteryLevel={avgBatteryLevel}
            activeDeliveriesCount={activeDeliveriesCount}
          />
          
          
          <AIInsightsPanel />
          {/* Add Predictive Maintenance section */}
          

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h4">Dashboard </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </Box>

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {alerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    severity={alert.type}
                    sx={{ mb: 1 }}
                    onClose={() => {
                      setAlerts(alerts.filter((a) => a.id !== alert.id));
                    }}
                  >
                    {alert.message} - {alert.time}
                  </Alert>
                ))}
              </Box>
            )}

            <Grid container spacing={3}>
              {/* Statistics Cards */}
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Vehicles"
                  value={loadingVehicles ? '...' : activeVehicleCount}
                  icon={<VehicleIcon sx={{ color: 'primary.main' }} />}
                  color="primary"
                  trend={5}
                  onViewDetails={() => handleViewDetails('activeVehicles')}
                />
              </Grid>
              
              {/* Three separate StatCards for vehicle delivery statuses */}
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="In Transit Vehicles"
                  value={loadingDeliveries ? '...' : inTransitCount}
                  icon={<DeliveryIcon sx={{ color: 'info.main' }} />}
                  color="info"
                  trend={2}
                  onViewDetails={() => handleViewDetails('inTransitVehicles')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Assigned Vehicles"
                  value={loadingDeliveries ? '...' : assignedCount}
                  icon={<DeliveryIcon sx={{ color: 'warning.main' }} />}
                  color="warning"
                  trend={-5}
                  onViewDetails={() => handleViewDetails('assignedVehicles')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending Vehicles"
                  value={loadingDeliveries ? '...' : pendingCount}
                  icon={<DeliveryIcon sx={{ color: 'error.main' }} />}
                  color="error"
                  trend={6}
                  onViewDetails={() => handleViewDetails('pendingVehicles')}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Deliveries"
                  value={loadingDeliveries ? '...' : activeDeliveriesCount}
                  icon={<DeliveryIcon sx={{ color: 'success.main' }} />}
                  color="success"
                  trend={-2}
                  onViewDetails={() => handleViewDetails('activeDeliveries')}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Damaged Vehicles"
                  value={loadingDamaged ? '...' : damagedVehicles.length}
                  icon={<BuildIcon sx={{ color: 'secondary.main' }} />}
                  color="secondary"
                  trend={2}
                  onViewDetails={() => handleViewDetails('damagedVehicles')}
                />
              </Grid>

              
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Avg. Battery Level"
                  value={loadingDeliveries ? '...' : (avgBatteryLevel !== 'N/A' ? `${avgBatteryLevel}%` : 'N/A')}
                  icon={<BatteryIcon sx={{ color: 'warning.main' }} />}
                  color="warning"
                  trend={-4}
                  onViewDetails={() => handleViewDetails('avgBattery')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Avg. Speed"
                  value={loadingDeliveries ? '...' : (avgSpeed !== 'N/A' ? `${avgSpeed} km/h` : 'N/A')}
                  icon={<SpeedIcon sx={{ color: 'error.main' }} />}
                  color="error"
                  trend={1}
                  onViewDetails={() => handleViewDetails('avgSpeed')}
                />
              </Grid>

              

              {/* MiniLoop Video spanning both columns */}
              <Grid item xs={12}>
                <Paper sx={{ p: 0, mb: 3, overflow: 'hidden', borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', background: 'rgba(255,255,255,0.85)' }}>
                  <video
                    src="/MiniLoop_Solutions.mp4"
                    style={{ width: '100%', height: '88vh', objectFit: 'cover', display: 'block' }}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </Paper>
              </Grid>

              {/* Fleet Status */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Fleet Status
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Available Vehicles"
                        secondary={`${percent(availableVehicles)}% of fleet`}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="In Transit"
                        secondary={`${percent(inTransitVehicles)}% of fleet`}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Maintenance"
                        secondary={`${percent(maintenanceVehicles)}% of fleet`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              {/* Recent Deliveries */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Deliveries
                  </Typography>
                  <List>
                    {recentDeliveries.length > 0 ? recentDeliveries.map((delivery) => (
                      <React.Fragment key={delivery._id}>
                        <ListItem>
                          <ListItemText
                            primary={`Delivery #${delivery.deliveryId || delivery._id}`}
                            secondary={delivery.status}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {delivery.estimatedDelivery ? new Date(delivery.estimatedDelivery).toLocaleString() : ''}
                          </Typography>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    )) : (
                      <ListItem>
                        <ListItemText primary="No recent deliveries." />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Dialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
            <DialogTitle>{detailsDialogTitle}</DialogTitle>
            <DialogContent>
              <List>
                {detailsDialogContent.length > 0 ? (
                  detailsDialogContent.map((item, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No details available." />
                  </ListItem>
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailsDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </div>
    </Box>
  );
}

export default Dashboard; 