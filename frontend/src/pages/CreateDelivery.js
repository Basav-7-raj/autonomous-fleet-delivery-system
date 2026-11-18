import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateDelivery.css'; // Import custom CSS for styling

const CreateDelivery = () => {
  const [productType, setProductType] = useState('');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [route, setRoute] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vehicles?status=available`);
        setVehicles(response.data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  const fetchRoute = async () => {
    if (!pickupLocation || !dropLocation) {
      alert('Please select both pickup and drop locations.');
      return;
    }

    try {
      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          params: {
            api_key: process.env.REACT_APP_ORS_API_KEY,
            start: `${pickupLocation.lng},${pickupLocation.lat}`,
            end: `${dropLocation.lng},${dropLocation.lat}`,
          },
        }
      );

      if (response.data && response.data.features && response.data.features.length > 0) {
        const coordinates = response.data.features[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );
        setRoute(coordinates);
      } else {
        alert('No route found. Please try different locations.');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      alert('Failed to fetch route. Please try again.');
    }
  };

  const handleConfirmDelivery = async () => {
    if (!productType || !pickupLocation || !dropLocation || !selectedVehicle) {
      alert('Please fill all fields and select a vehicle.');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/deliveries`, {
        productType,
        pickupLocation,
        dropLocation,
        vehicleId: selectedVehicle,
      });
      alert('Delivery confirmed!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    }
  };

  return (
    <Container className="create-delivery-container">
      <Typography variant="h4" className="create-delivery-title">
        Create Delivery
      </Typography>
      <Box className="form-container">
        <FormControl fullWidth className="form-control">
          <InputLabel>Product Type</InputLabel>
          <Select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <MenuItem value="Medical">Medical</MenuItem>
            <MenuItem value="Food">Food</MenuItem>
            <MenuItem value="Electronics">Electronics</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={2} className="map-container">
          <Grid item xs={6}>
            <Typography variant="h6">Select Pickup Location</Typography>
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              scrollWheelZoom={false}
              className="map"
              onClick={(e) => setPickupLocation(e.latlng)}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              {pickupLocation && <Marker position={pickupLocation} />}
              {route.length > 0 && <Polyline positions={route} color="blue" />}
            </MapContainer>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Select Drop Location</Typography>
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              scrollWheelZoom={false}
              className="map"
              onClick={(e) => setDropLocation(e.latlng)}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              />
              {dropLocation && <Marker position={dropLocation} />}
              {route.length > 0 && <Polyline positions={route} color="blue" />}
            </MapContainer>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          onClick={fetchRoute}
          className="fetch-route-button"
        >
          Fetch Route
        </Button>

        <FormControl fullWidth className="form-control">
          <InputLabel>Available Vehicles</InputLabel>
          <Select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
          >
            {vehicles.map((vehicle) => (
              <MenuItem key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleConfirmDelivery}
          className="confirm-delivery-button"
        >
          Confirm Delivery
        </Button>
      </Box>
    </Container>
  );
};

export default CreateDelivery;