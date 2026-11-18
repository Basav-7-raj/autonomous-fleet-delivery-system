import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar as VehicleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Cloud as WeatherIcon,
  Traffic as TrafficIcon,
  Block as RoadblockIcon,
  PriorityHigh as PriorityIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';

// Demo data
const demoTrafficData = {
  level: 'medium',
  affectedAreas: ['Connaught Place', 'Rajiv Chowk', 'Karol Bagh'],
  timestamp: new Date(),
  source: 'demo',
  confidence: 0.9
};

const demoWeatherData = {
  temperature: 32,
  conditions: 'clear',
  visibility: 10,
  precipitation: 0,
  windSpeed: 15,
  timestamp: new Date(),
  source: 'demo'
};

const demoRoadblocks = [
  {
    _id: '1',
    location: 'Rajiv Chowk',
    coordinates: { lat: 28.6329, lng: 77.2197 },
    reason: 'Road Construction',
    severity: 3,
    isActive: true,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    reportedBy: 'demo_user',
    verificationStatus: 'verified'
  },
  {
    _id: '2',
    location: 'Karol Bagh',
    coordinates: { lat: 28.6517, lng: 77.1917 },
    reason: 'Traffic Signal Malfunction',
    severity: 2,
    isActive: true,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    reportedBy: 'demo_user',
    verificationStatus: 'verified'
  }
];

const demoDeliveries = [
  {
    _id: '1',
    pickupLocation: 'Connaught Place',
    deliveryLocation: 'Lajpat Nagar',
    priority: 'high',
    status: 'in_progress',
    distance: 8.5,
    timeWindow: '2 hours',
    // Example coordinates for demo route
    pickupCoordinates: { lat: 28.6329, lng: 77.2197 },
    deliveryCoordinates: { lat: 28.5667, lng: 77.2410 },
  },
  {
    _id: '2',
    pickupLocation: 'Karol Bagh',
    deliveryLocation: 'Saket',
    priority: 'medium',
    status: 'in_progress',
    distance: 12.3,
    timeWindow: '3 hours',
    pickupCoordinates: { lat: 28.6481, lng: 77.1917 },
    deliveryCoordinates: { lat: 28.5245, lng: 77.2163 },
  },
  {
    _id: '3',
    pickupLocation: 'Rajiv Chowk',
    deliveryLocation: 'Dwarka',
    priority: 'low',
    status: 'in_progress',
    distance: 15.7,
    timeWindow: '4 hours',
    pickupCoordinates: { lat: 28.6271, lng: 77.2166 },
    deliveryCoordinates: { lat: 28.5999, lng: 77.0186 },
  }
];

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 28.6139, // Default to Delhi
  lng: 77.2090
};

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

function RouteOptimization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trafficData, setTrafficData] = useState(demoTrafficData);
  const [weatherData, setWeatherData] = useState(demoWeatherData);
  const [roadblocks, setRoadblocks] = useState(demoRoadblocks);
  const [activeDeliveries, setActiveDeliveries] = useState(demoDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);

  // Simulate data refresh
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update demo data with slight variations
      setTrafficData({
        ...demoTrafficData,
        level: ['low', 'medium', 'high', 'severe'][Math.floor(Math.random() * 4)],
        timestamp: new Date()
      });
      
      setWeatherData({
        ...demoWeatherData,
        temperature: Math.floor(Math.random() * 10) + 28,
        conditions: ['clear', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
        timestamp: new Date()
      });
      
      setRoadblocks(demoRoadblocks.map(block => ({
        ...block,
        severity: Math.floor(Math.random() * 3) + 1
      })));
      
      setActiveDeliveries(demoDeliveries);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeliverySelect = useCallback((delivery) => {
    setSelectedDelivery(delivery);
    if (isMapLoaded && delivery && delivery.pickupCoordinates && delivery.deliveryCoordinates) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: delivery.pickupCoordinates,
          destination: delivery.deliveryCoordinates,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Directions request failed due to ${status}`);
            setDirections(null);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [isMapLoaded]);

  useEffect(() => {
    handleRefresh();
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(handleRefresh, 300000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    setMapLoadError(false); // Reset error on successful load
  }, []);

  const onMapUnmount = useCallback(() => {
    setIsMapLoaded(false);
  }, []);

  const onMapError = useCallback(() => {
    setMapLoadError(true);
    setIsMapLoaded(false); // Ensure map is not considered loaded if there's an error
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Dynamic Route Optimization (Demo Mode)</Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh Data
            </Button>
          </Box>
        </Grid>

        {/* Real-time Data Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Traffic Conditions
                <TrafficIcon sx={{ ml: 1 }} />
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Traffic Level: {trafficData.level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Affected Areas: {trafficData.affectedAreas.join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Last Updated: {new Date(trafficData.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weather Conditions
                <WeatherIcon sx={{ ml: 1 }} />
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Temperature: {weatherData.temperature}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Conditions: {weatherData.conditions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visibility: {weatherData.visibility}km
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Last Updated: {new Date(weatherData.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Roadblocks
                <RoadblockIcon sx={{ ml: 1 }} />
              </Typography>
              {roadblocks.length > 0 ? (
                <Box>
                  {roadblocks.map((block) => (
                    <Chip
                      key={block._id}
                      label={`${block.location} - ${block.reason} (Severity: ${block.severity})`}
                      color="error"
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active roadblocks
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Map and Active Deliveries */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {(mapLoadError || !GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') ? (
              <Alert severity="warning" sx={{ p: 2 }}>
                <Typography variant="h6">Demo Map - Google Maps API Key Missing or Load Error</Typography>
                <Typography variant="body2">
                  The map is running in demo mode because a valid Google Maps API key is not set, or there was an error loading the Google Maps script.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  To enable full map functionality, please add your Google Maps API key to the `frontend/.env` file:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                  REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  You may need to restart the frontend development server after updating the .env file.
                </Typography>
                <Box sx={{ mt: 2, height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    <img
                        src="/googlemaps.jpg"
                        alt="Demo Map Placeholder"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.8,
                            filter: 'grayscale(50%)'
                        }}
                    />
                </Box>
              </Alert>
            ) : (
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} onLoad={onMapLoad} onUnmount={onMapUnmount} onError={onMapError}>
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={12}
                >
                  {directions && <DirectionsRenderer directions={directions} />}
                  {roadblocks.map((block) => (
                    <Marker
                      key={block._id}
                      position={block.coordinates}
                      icon={{
                        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                      }}
                    />
                  ))}
                </GoogleMap>
              </LoadScript>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Active Deliveries
            </Typography>
            {activeDeliveries.length > 0 ? (
              activeDeliveries.map((delivery) => (
                <Card
                  key={delivery._id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    bgcolor: selectedDelivery?._id === delivery._id ? 'action.selected' : 'background.paper'
                  }}
                  onClick={() => handleDeliverySelect(delivery)}
                >
                  <CardContent>
                    <Typography variant="subtitle1">
                      Delivery #{delivery._id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      From: {delivery.pickupLocation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      To: {delivery.deliveryLocation}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        icon={<PriorityIcon />}
                        label={`Priority: ${delivery.priority}`}
                        color={delivery.priority === 'high' ? 'error' : 'default'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active deliveries
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Loading and Error States */}
        {loading && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default RouteOptimization; 