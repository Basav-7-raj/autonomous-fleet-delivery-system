const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Delivery = require('../models/delivery');
const TrafficData = require('../models/TrafficData');
const WeatherData = require('../models/WeatherData');
const Roadblock = require('../models/Roadblock');
const axios = require('axios');
const polyline = require('polyline');

// Get current traffic data
router.get('/traffic/current', auth, async (req, res) => {
  try {
    const trafficData = await TrafficData.findOne()
      .sort({ timestamp: -1 })
      .limit(1);
    
    if (!trafficData) {
      return res.status(404).json({ message: 'No traffic data available' });
    }

    res.json(trafficData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current weather data
router.get('/weather/current', auth, async (req, res) => {
  try {
    const weatherData = await WeatherData.findOne()
      .sort({ timestamp: -1 })
      .limit(1);
    
    if (!weatherData) {
      return res.status(404).json({ message: 'No weather data available' });
    }

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active roadblocks
router.get('/roadblocks/active', auth, async (req, res) => {
  try {
    const roadblocks = await Roadblock.find({
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    res.json(roadblocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Optimize route for a delivery
router.post('/optimize', auth, async (req, res) => {
  try {
    const { deliveryId } = req.body;
    
    // Get delivery details
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Get real-time data
    const [trafficData, weatherData, roadblocks] = await Promise.all([
      TrafficData.findOne().sort({ timestamp: -1 }),
      WeatherData.findOne().sort({ timestamp: -1 }),
      Roadblock.find({ isActive: true, expiresAt: { $gt: new Date() } })
    ]);

    // Optimize route using ML model
    const optimizedRoute = await optimizeRoute({
      delivery,
      trafficData,
      weatherData,
      roadblocks
    });

    res.json(optimizedRoute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/route', async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;
  const apiKey = process.env.ORS_API_KEY;
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
  try {
    const response = await axios.get(url);
    const coords = response.data.features[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    res.json({ path: coords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update current traffic data
router.post('/traffic/current', async (req, res) => {
  try {
    const { level, speed } = req.body;
    const trafficData = new TrafficData({
      level,
      speed,
      timestamp: new Date()
    });
    await trafficData.save();
    res.status(201).json(trafficData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 