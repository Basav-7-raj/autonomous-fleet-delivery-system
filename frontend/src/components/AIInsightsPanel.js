// frontend/src/components/AIInsightsPanel.js - MATCHING STYLE VERSION
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  IconButton,
  Tooltip,
  Button,
  Avatar,
  Badge,
  Divider,
  Fade,
  Zoom
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Nature as EcoIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
  DirectionsCar as VehicleIcon,
  LocalShipping as DeliveryIcon,
  BatteryChargingFull as BatteryIcon,
  Route as RouteIcon,
  Build as BuildIcon,
  LocalHospital as EmergencyIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Timer as TimerIcon,
  LocalGasStation as FuelIcon,
  Nature as CarbonIcon
} from '@mui/icons-material';
import io from 'socket.io-client';
import axios from 'axios';

function AIInsightsPanel() {
  const [aiInsights, setAiInsights] = useState({
    fleetEfficiency: 85,
    carbonSavings: 12.5,
    totalDecisions: 0,
    activeVehicles: 0,
    pendingDeliveries: 0,
    averageBattery: 0,
    routesOptimized: 0,
    timeSaved: 0,
    fuelSaved: 0,
    customerSatisfaction: 0,
    onTimeDelivery: 0,
    peakHourEfficiency: 0,
    maintenanceAlerts: 0,
    emergencyResponses: 0
  });
  const [predictions, setPredictions] = useState([]);
  const [swarmUpdates, setSwarmUpdates] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isPeakHour, setIsPeakHour] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO for real-time AI updates
    const newSocket = io('https://autonomous-vehicle-lyze.onrender.com');
    setSocket(newSocket);

    newSocket.on('aiDecision', (data) => {
      console.log('🧠 AI Decision received:', data);
      updateInsights(data);
    });

    newSocket.on('swarmUpdate', (data) => {
      console.log('🔄 Swarm update received:', data);
      setSwarmUpdates(prev => [data, ...prev.slice(0, 4)]);
    });

    // Load initial AI insights
    loadAIInsights();

    // Auto-refresh insights every 30 seconds
    const interval = setInterval(loadAIInsights, 30000);

    // Check if it's peak hour
    const currentHour = new Date().getHours();
    setIsPeakHour(currentHour >= 8 && currentHour <= 10 || currentHour >= 17 && currentHour <= 19);

    return () => {
      newSocket.close();
      clearInterval(interval);
    };
  }, []);

  const loadAIInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://autonomous-vehicle-lyze.onrender.com/api/ai/insights', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAiInsights(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const triggerAIDecision = async (decisionType = 'ROUTE_OPTIMIZATION') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://autonomous-vehicle-lyze.onrender.com/api/ai/decision', {
        decisionType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('AI Decision triggered:', response.data);
    } catch (error) {
      console.error('Error triggering AI decision:', error);
    }
    setLoading(false);
  };

  const triggerSwarmUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('https://autonomous-vehicle-lyze.onrender.com/api/ai/swarm-update', {
        vehicleId: 'V-001'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Swarm update triggered:', response.data);
    } catch (error) {
      console.error('Error triggering swarm update:', error);
    }
  };

  const updateInsights = (aiData) => {
    setPredictions(prev => [{
      id: Date.now(),
      type: aiData.type,
      message: aiData.decision.reasoning || aiData.decision.action,
      confidence: aiData.decision.confidence || 85,
      timestamp: new Date(),
      vehicleId: aiData.vehicleId,
      deliveryId: aiData.deliveryId,
      timeSaved: aiData.decision.timeSaved || 0,
      fuelSaved: aiData.decision.fuelSaved || 0,
      carbonSavings: aiData.decision.carbonSavings || 0,
      details: aiData.decision
    }, ...prev.slice(0, 4)]);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'ROUTE_OPTIMIZATION': return <RouteIcon />;
      case 'BATTERY_MANAGEMENT': return <BatteryIcon />;
      case 'EMERGENCY_RESPONSE': return <EmergencyIcon />;
      case 'VEHICLE_ASSIGNMENT': return <VehicleIcon />;
      case 'PREDICTIVE_MAINTENANCE': return <BuildIcon />;
      default: return <BrainIcon />;
    }
  };

  const getInsightColor = (confidence) => {
    if (confidence > 95) return 'success';
    if (confidence > 85) return 'warning';
    return 'error';
  };

  const getSwarmIcon = (type) => {
    switch (type) {
      case 'traffic_update': return <SpeedIcon />;
      case 'weather_update': return <EcoIcon />;
      case 'battery_alert': return <BatteryIcon />;
      case 'delivery_update': return <DeliveryIcon />;
      case 'route_optimization': return <RouteIcon />;
      default: return <TrendingIcon />;
    }
  };

  const getSwarmColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Paper sx={{ 
      p: 3, 
      mb: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white',
      borderRadius: 3,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.18)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 50, height: 50 }}>
          <BrainIcon />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            AI Fleet Brain
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Intelligent Fleet Management System
          </Typography>
        </Box>
        <Chip 
          label="LIVE" 
          color="success" 
          size="small" 
          sx={{ mr: 2, color: 'white' }}
        />
        <Typography variant="caption" sx={{ mr: 2, opacity: 0.8 }}>
          Last update: {lastUpdate.toLocaleTimeString()}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => triggerAIDecision('ROUTE_OPTIMIZATION')}
          disabled={loading}
          startIcon={<RouteIcon />}
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          {loading ? 'Processing...' : 'Route Optimization'}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => triggerAIDecision('VEHICLE_ASSIGNMENT')}
          disabled={loading}
          startIcon={<VehicleIcon />}
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Smart Assignment
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => triggerAIDecision('BATTERY_MANAGEMENT')}
          disabled={loading}
          startIcon={<BatteryIcon />}
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Battery Alert
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => triggerAIDecision('EMERGENCY_RESPONSE')}
          disabled={loading}
          startIcon={<EmergencyIcon />}
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Emergency
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => triggerAIDecision('PREDICTIVE_MAINTENANCE')}
          disabled={loading}
          startIcon={<BuildIcon />}
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Maintenance
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={triggerSwarmUpdate}
          startIcon={<TrendingIcon />}
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Swarm Update
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Enhanced AI Metrics */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon sx={{ mr: 1, color: '#4CAF50' }} />
                <Typography variant="h6">
                  Fleet Efficiency
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={aiInsights.fleetEfficiency} 
                sx={{ mb: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{aiInsights.fleetEfficiency}% Optimized</span>
                {isPeakHour && <Chip label="Peak Hour" size="small" color="warning" />}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CarbonIcon sx={{ mr: 1, color: '#4CAF50' }} />
                <Typography variant="h6">
                  Carbon Savings
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {aiInsights.carbonSavings}kg
              </Typography>
              <Typography variant="body2">
                CO₂ Saved Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingIcon sx={{ mr: 1, color: '#2196F3' }} />
                <Typography variant="h6">
                  Swarm Intelligence
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {swarmUpdates.length}
              </Typography>
              <Typography variant="body2">
                Active Communications
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BrainIcon sx={{ mr: 1, color: '#FF9800' }} />
                <Typography variant="h6">
                  AI Decisions
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {aiInsights.totalDecisions}
              </Typography>
              <Typography variant="body2">
                Total Decisions Made
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Predictions with Enhanced Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BrainIcon sx={{ mr: 1 }} />
            AI Predictions & Decisions
          </Typography>
          <List>
            {predictions.length > 0 ? predictions.map((prediction, index) => (
              <ListItem key={prediction.id} sx={{ 
                background: 'rgba(255,255,255,0.05)', 
                mb: 1, 
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <ListItemIcon>
                  {getInsightIcon(prediction.type)}
                </ListItemIcon>
                <ListItemText
                  primary={prediction.message}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          label={`${prediction.confidence}% confidence`}
                          size="small"
                          color={getInsightColor(prediction.confidence)}
                        />
                        <Typography variant="caption">
                          {new Date(prediction.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      {prediction.timeSaved > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            icon={<TimerIcon />}
                            label={`${prediction.timeSaved}min saved`} 
                            size="small" 
                            color="info" 
                          />
                          <Chip 
                            icon={<FuelIcon />}
                            label={`${prediction.fuelSaved}L fuel`} 
                            size="small" 
                            color="warning" 
                          />
                          <Chip 
                            icon={<CarbonIcon />}
                            label={`${prediction.carbonSavings}kg CO₂`} 
                            size="small" 
                            color="success" 
                          />
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            )) : (
              <ListItem>
                <ListItemText primary="No AI decisions yet. Click buttons above to see live updates!" />
              </ListItem>
            )}
          </List>
        </Grid>

        {/* Enhanced Swarm Updates */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingIcon sx={{ mr: 1 }} />
            Swarm Intelligence Updates
          </Typography>
          <List>
            {swarmUpdates.length > 0 ? swarmUpdates.map((update, index) => (
              <ListItem key={index} sx={{ 
                background: 'rgba(255,255,255,0.05)', 
                mb: 1, 
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <ListItemIcon>
                  {getSwarmIcon(update.data.type)}
                </ListItemIcon>
                <ListItemText
                  primary={`${update.vehicleId} - ${update.data.message}`}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          label={update.data.type.replace('_', ' ')}
                          size="small"
                          color={getSwarmColor(update.data.severity)}
                        />
                        <Typography variant="caption">
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Location: {update.data.location}
                      </Typography>
                      {update.data.impact && (
                        <Typography variant="body2" color="text.secondary">
                          Impact: {update.data.impact}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            )) : (
              <ListItem>
                <ListItemText primary="No swarm updates yet. Click 'Swarm Update' to see vehicles sharing information!" />
              </ListItem>
            )}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default AIInsightsPanel;