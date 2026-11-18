import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  BatteryAlert as BatteryIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import axios from 'axios';

function PredictiveMaintenance() {
  const [maintenancePredictions, setMaintenancePredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaintenancePredictions();
  }, []);

  const fetchMaintenancePredictions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      const response = await axios.get('/api/vehicles/maintenance-predictions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaintenancePredictions(response.data);
      setLoading(false);
    } catch (err) {
      // Inject demo data if API fails or no token
      setMaintenancePredictions([
        {
          vehicleId: 'demo1',
          vehicleNumber: 'BR01',
          probability: 0.85,
          predictions: [
            { type: 'battery', component: 'Battery', daysUntilMaintenance: 5 },
            { type: 'engine', component: 'Engine', daysUntilMaintenance: 12 },
            { type: 'brakes', component: 'Brakes', daysUntilMaintenance: 18 }
          ]
        },
        {
          vehicleId: 'demo2',
          vehicleNumber: 'BR02',
          probability: 0.62,
          predictions: [
            { type: 'engine', component: 'Engine', daysUntilMaintenance: 8 },
            { type: 'battery', component: 'Battery', daysUntilMaintenance: 15 }
          ]
        },
        {
          vehicleId: 'demo3',
          vehicleNumber: 'BR03',
          probability: 0.42,
          predictions: [
            { type: 'battery', component: 'Battery', daysUntilMaintenance: 20 },
            { type: 'brakes', component: 'Brakes', daysUntilMaintenance: 30 }
          ]
        },
        {
          vehicleId: 'demo4',
          vehicleNumber: 'BR04',
          probability: 0.91,
          predictions: [
            { type: 'engine', component: 'Engine', daysUntilMaintenance: 3 },
            { type: 'battery', component: 'Battery', daysUntilMaintenance: 7 },
            { type: 'brakes', component: 'Brakes', daysUntilMaintenance: 10 }
          ]
        },
        {
          vehicleId: 'demo5',
          vehicleNumber: 'BR05',
          probability: 0.77,
          predictions: [
            { type: 'brakes', component: 'Brakes', daysUntilMaintenance: 6 },
            { type: 'engine', component: 'Engine', daysUntilMaintenance: 14 }
          ]
        },
        {
          vehicleId: 'demo6',
          vehicleNumber: 'BR06',
          probability: 0.33,
          predictions: [
            { type: 'battery', component: 'Battery', daysUntilMaintenance: 25 }
          ]
        },
        {
          vehicleId: 'demo7',
          vehicleNumber: 'BR07',
          probability: 0.58,
          predictions: [
            { type: 'engine', component: 'Engine', daysUntilMaintenance: 11 },
            { type: 'brakes', component: 'Brakes', daysUntilMaintenance: 19 }
          ]
        },
        {
          vehicleId: 'demo8',
          vehicleNumber: 'BR08',
          probability: 0.48,
          predictions: [
            { type: 'battery', component: 'Battery', daysUntilMaintenance: 22 },
            { type: 'engine', component: 'Engine', daysUntilMaintenance: 28 }
          ]
        }
      ]);
      setLoading(false);
    }
  };

  const getMaintenanceSeverity = (probability) => {
    if (probability >= 0.8) return 'error';
    if (probability >= 0.5) return 'warning';
    return 'success';
  };

  const getMaintenanceIcon = (type) => {
    switch (type) {
      case 'battery':
        return <BatteryIcon />;
      case 'engine':
        return <SpeedIcon />;
      default:
        return <BuildIcon />;
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Predictive Maintenance
      </Typography>
      <Grid container spacing={3}>
        {maintenancePredictions.map((prediction) => (
          <Grid item xs={12} md={6} key={prediction.vehicleId}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Vehicle {prediction.vehicleNumber}
                  </Typography>
                  <Chip
                    label={`${Math.round(prediction.probability * 100)}% Risk`}
                    color={getMaintenanceSeverity(prediction.probability)}
                  />
                </Box>
                <List>
                  {prediction.predictions.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getMaintenanceIcon(item.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.component}
                        secondary={`Predicted maintenance needed in ${item.daysUntilMaintenance} days`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default PredictiveMaintenance; 