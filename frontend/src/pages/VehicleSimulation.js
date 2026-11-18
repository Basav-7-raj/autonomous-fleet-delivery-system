import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import {
  Button,
  TextField,
  Paper,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useMapEvents } from 'react-leaflet';

// Custom icons
const carIcon = new L.Icon({
  iconUrl: '/car.webp',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});
const startIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});
const endIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});
const accidentIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/565/565547.png', // accident icon
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const fetchRoute = async (start, end) => {
  try {
    const res = await axios.get('/api/route', {
      params: {
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng
      }
    });
    console.log('Backend /api/route response:', res.data); // Debug log
    // Convert to array of objects {lat, lng}
    const coords = res.data.features[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    return coords;
  } catch (err) {
    alert('Error fetching route: ' + err.message);
    return [];
  }
};

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

function AccidentLocationPicker({ onPick }) {
  useMapEvents({
    click(e)  {
      onPick(e.latlng);
    },
  });
  return null;
}

function useFadeInOnScroll() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

function VehicleSimulation() {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '',
    startLat: '',
    startLng: '',
    endLat: '',
    endLng: ''
  });
  const [pickMode, setPickMode] = useState(null); // 'start' or 'end'
  const [tempMarker, setTempMarker] = useState(null);
  const [accidentMode, setAccidentMode] = useState(false);
  const [accidentLocations, setAccidentLocations] = useState([]);
  const [mapRef, mapVisible] = useFadeInOnScroll();
  const [videoRef, videoVisible] = useFadeInOnScroll();
  const [cardsRef, cardsVisible] = useFadeInOnScroll();
  const videoElementRef = useRef(null);

  useEffect(() => {
    let interval;
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/vehicles/simulate');
        setVehicles(res.data);
      } catch (err) {
        console.error('Error fetching simulated vehicle data:', err.message);
      }
    };
    fetchData();
    interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        const res = await axios.get('/api/accident-locations');
        setAccidentLocations(res.data);
      } catch (err) {
        // ignore if endpoint not ready
      }
    };
    fetchAccidents();
    const accInt = setInterval(fetchAccidents, 5000);
    return () => clearInterval(accInt);
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const start = { lat: parseFloat(form.startLat), lng: parseFloat(form.startLng) };
      const end = { lat: parseFloat(form.endLat), lng: parseFloat(form.endLng) };
      // Only send vehicleId, start, and end to the backend
      await axios.post('/api/vehicles/simulate', {
        vehicleId: form.vehicleId,
        start,
        end
      });
      setForm({ vehicleId: '', startLat: '', startLng: '', endLat: '', endLng: '' });
      setShowForm(false);
    } catch (err) {
      alert('Error adding manual vehicle: ' + err.message);
    }
  };

  const handlePick = (latlng) => {
    if (pickMode === 'start') {
      setForm(f => ({ ...f, startLat: latlng.lat, startLng: latlng.lng }));
    } else if (pickMode === 'end') {
      setForm(f => ({ ...f, endLat: latlng.lat, endLng: latlng.lng }));
    }
    setTempMarker(null);
    setPickMode(null);
  };

  const handleAccidentPick = async (latlng) => {
    try {
      await axios.post('/api/accident-locations', { lat: latlng.lat, lng: latlng.lng });
      setAccidentMode(false);
      // Refetch accident locations
      const res = await axios.get('/api/accident-locations');
      setAccidentLocations(res.data);
    } catch (err) {
      alert('Error adding accident location');
      setAccidentMode(false);
    }
  };

  return (
    <Box sx={{ background: '#f4f6fa', minHeight: '100vh', py: 0 }}>
      <Paper elevation={4} sx={{ maxWidth: 1800, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Vehicle Simulation <Chip label="Real-Time" color="primary" size="small" />
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Button
            variant={showForm ? "outlined" : "contained"}
            color="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Manual Vehicle'}
          </Button>
          <Button
            variant={accidentMode ? "outlined" : "contained"}
            color="error"
            onClick={() => setAccidentMode(!accidentMode)}
            sx={{ ml: 2 }}
          >
            {accidentMode ? 'Click on Map...' : 'Add Accident Location'}
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ display: 'inline', mr: 1 }}>Legend:</Typography>
            <img src="/car.webp" alt="Car" width={28} style={{ verticalAlign: 'middle' }} /> <span style={{marginRight:8}}>Vehicle</span>
            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Start" width={20} style={{ verticalAlign: 'middle' }} /> <span style={{marginRight:8}}>Start</span>
            <img src="https://cdn-icons-png.flaticon.com/512/149/149060.png" alt="End" width={20} style={{ verticalAlign: 'middle' }} /> End
            <img src="https://cdn-icons-png.flaticon.com/512/565/565547.png" alt="Accident" width={20} style={{ verticalAlign: 'middle' }} /> <span style={{marginRight:8}}>Accident</span>
          </Box>
        </Stack>
        {showForm && (
          <Paper elevation={2} sx={{ p: 2, mb: 2, background: '#e3f2fd' }}>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField name="vehicleId" label="Vehicle ID" value={form.vehicleId} onChange={handleFormChange} required />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField name="startLat" label="Start Lat" value={form.startLat} onChange={handleFormChange} required type="number" size="small" />
                <TextField name="startLng" label="Start Lng" value={form.startLng} onChange={handleFormChange} required type="number" size="small" />
                <Button onClick={() => { setPickMode('start'); setTempMarker(null); }} size="small" sx={{ minWidth: 0, ml: 1 }} title="Pick start from map">
                  <FaMapMarkerAlt color={pickMode==='start' ? 'red' : 'gray'} />
                </Button>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField name="endLat" label="End Lat" value={form.endLat} onChange={handleFormChange} required type="number" size="small" />
                <TextField name="endLng" label="End Lng" value={form.endLng} onChange={handleFormChange} required type="number" size="small" />
                <Button onClick={() => { setPickMode('end'); setTempMarker(null); }} size="small" sx={{ minWidth: 0, ml: 1 }} title="Pick end from map">
                  <FaMapMarkerAlt color={pickMode==='end' ? 'blue' : 'gray'} />
                </Button>
              </Box>
              <Button type="submit" variant="contained" color="primary">Add</Button>
            </form>
          </Paper>
        )}
        <Box
          ref={mapRef}
          sx={{
            height: '70vh',
            width: '100%',
            mb: 3,
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 12px 32px 0 rgba(31, 38, 135, 0.25), 0 1.5px 8px 0 rgba(33,150,243,0.10)',
            transition: 'box-shadow 0.5s, border-radius 0.5s, opacity 1s',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.25)',
            position: 'relative',
            opacity: mapVisible ? 1 : 0,
            transform: mapVisible ? 'none' : 'translateY(40px)',
          }}
        >
          <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {vehicles.map((v, idx) => (
              <React.Fragment key={v.vehicleId}>
                {v.path && v.path.length > 1 && (
                  <Polyline positions={v.path.map(p => [p.lat, p.lng])} color={v.status === 'completed' ? 'green' : 'blue'} />
                )}
                {v.start && (
                  <Marker position={[v.start.lat, v.start.lng]} icon={startIcon}>
                    <Popup>Start: {v.vehicleId}</Popup>
                  </Marker>
                )}
                {v.end && (
                  <Marker position={[v.end.lat, v.end.lng]} icon={endIcon}>
                    <Popup>End: {v.vehicleId}</Popup>
                  </Marker>
                )}
                {/* Animated marker pop-in */}
                <Marker position={[v.location.lat, v.location.lng]} icon={carIcon}>
                  <Popup>
                    <b>ID:</b> {v.vehicleId}<br />
                    <b>Speed:</b> {v.speed} km/h<br />
                    <b>Battery:</b> {v.battery}%<br />
                    <b>Status:</b> {v.status}<br />
                    {v.status === 'completed' && <span style={{color:'green'}}>Trip Completed!</span>}
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
            {accidentLocations.map((loc, idx) => (
              <Marker key={idx} position={[loc.lat, loc.lng]} icon={accidentIcon}>
                <Popup>Accident Location<br/>Lat: {loc.lat}<br/>Lng: {loc.lng}</Popup>
              </Marker>
            ))}
            {/* Picker logic */}
            {pickMode && (
              <LocationPicker onPick={latlng => { setTempMarker(latlng); handlePick(latlng); }} />
            )}
            {tempMarker && (
              <Marker position={[tempMarker.lat, tempMarker.lng]} icon={pickMode==='start' ? startIcon : endIcon}>
                <Popup>Picked {pickMode === 'start' ? 'Start' : 'End'} Point</Popup>
              </Marker>
            )}
            {accidentMode && (
              <AccidentLocationPicker onPick={handleAccidentPick} />
            )}
          </MapContainer>
        </Box>
        {/* Nuro Driver Video Section */}
        <Box
          ref={videoRef}
          sx={{
            mb: 3,
            textAlign: 'center',
            position: 'relative',
            borderRadius: 4,
            background: '#171717',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            overflow: 'hidden',
            transition: 'box-shadow 0.5s, background 0.5s, opacity 1s',
            opacity: videoVisible ? 1 : 0,
            transform: videoVisible ? 'none' : 'translateY(40px)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#B5A197', letterSpacing: 1, mb: 1, transition: 'color 0.5s' }}>Nuro Driver Demo</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 0 }}>
            <video
              ref={videoElementRef}
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100vh',
                objectFit: 'contain',
                borderRadius: 16,
                boxShadow: '0 6px 32px 0 rgba(33,150,243,0.18)',
                border: '2.5px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.10)',
                transition: 'box-shadow 0.5s, border 0.5s',
                margin: 0,
                padding: 0,
                display: 'block',
                outline: 'none',
              }}
              onMouseEnter={() => {
                if (videoElementRef.current) videoElementRef.current.play();
              }}
              onMouseLeave={() => {
                if (videoElementRef.current) videoElementRef.current.pause();
              }}
              tabIndex={-1}
            >
              <source src="/Nuro-Driver-Silent-Video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        </Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#2d3a4b', letterSpacing: 1, mb: 2, transition: 'color 0.5s' }}>Simulated Vehicles</Typography>
        <Box
          ref={cardsRef}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3,
            mb: 2,
            transition: 'opacity 1s',
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? 'none' : 'translateY(40px)',
          }}
        >
          {vehicles.map((v, idx) => (
            <Card
              key={v.vehicleId}
              sx={{
                minWidth: 220,
                borderRadius: 3,
                boxShadow: '0 2px 16px 0 rgba(33,150,243,0.10)',
                transition: 'box-shadow 0.4s, transform 0.4s',
                background: 'linear-gradient(120deg, #171717 80%, #e3f2fd 100%)',
                cursor: 'pointer',
                perspective: 1000,
                '&:hover': {
                  boxShadow: '0 8px 32px 0 rgba(33,150,243,0.18)',
                  transform: 'scale(1.05)',
                },
              }}
              onMouseMove={e => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * 8;
                const rotateY = ((x - centerX) / centerX) * -8;
                card.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1976d2', letterSpacing: 0.5 }}>{v.vehicleId}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: <b>{v.status}</b><br />
                  Speed: {v.speed} km/h<br />
                  Battery: {v.battery}%
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default VehicleSimulation; 