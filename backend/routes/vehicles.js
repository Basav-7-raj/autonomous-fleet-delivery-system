const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const auth = require('../middleware/auth');
const SimulatedVehicleData = require('../models/SimulatedVehicleData');

// --- PUBLIC SIMULATION ROUTES ---
// POST /simulate - Add simulated vehicle data
router.post('/simulate', async (req, res) => {
  try {
    const { vehicleId, start, end } = req.body;
    if (start && end) {
      const axios = require('axios');
      const apiBase = req.protocol + '://' + req.get('host');
      let path = [start];
      let routeError = null;
      try {
        const routeRes = await axios.get(`${apiBase}/api/routes/route`, {
          params: {
            startLat: start.lat,
            startLng: start.lng,
            endLat: end.lat,
            endLng: end.lng
          }
        });
        console.log('Route API response:', JSON.stringify(routeRes.data));
        if (routeRes.data && Array.isArray(routeRes.data.path) && routeRes.data.path.length > 1) {
          path = routeRes.data.path;
        } else {
          routeError = 'Route API did not return a valid path.';
        }
      } catch (routeErr) {
        routeError = routeErr.message;
        console.error('Failed to generate path:', routeErr.message);
      }
      if (path.length <= 1) {
        return res.status(500).json({ error: 'Failed to generate a valid route for the vehicle.', details: routeError });
      }
      const data = {
        vehicleId,
        timestamp: new Date(),
        location: start,
        speed: 0,
        battery: 100,
        status: 'in_transit',
        start,
        end,
        t: 0,
        completed: false,
        path
      };
      const newData = new SimulatedVehicleData(data);
      await newData.save();
      return res.status(201).json(newData);
    }
    const newData = new SimulatedVehicleData(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /simulate - Get latest simulated data for all vehicles
router.get('/simulate', async (req, res) => {
  try {
    // Get the latest entry for each vehicleId
    const latestData = await SimulatedVehicleData.aggregate([
      { $sort: { vehicleId: 1, timestamp: -1 } },
      {
        $group: {
          _id: "$vehicleId",
          vehicleId: { $first: "$vehicleId" },
          timestamp: { $first: "$timestamp" },
          location: { $first: "$location" },
          speed: { $first: "$speed" },
          battery: { $first: "$battery" },
          status: { $first: "$status" },
          start: { $first: "$start" },
          end: { $first: "$end" },
          path: { $first: "$path" }
        }
      }
    ], { allowDiskUse: true });
    res.json(latestData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROTECTED VEHICLE ROUTES ---
// Get all vehicles
router.get('/', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('assignedDriver', 'name email')
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single vehicle by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedDriver', 'name email');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new vehicle
router.post('/', auth, async (req, res) => {
  try {
    const vehicle = new Vehicle({
      vehicleNumber: req.body.vehicleId,
      type: req.body.type,
      model: req.body.model || req.body.type, // Use model from body if available, else derive from type
      capacity: req.body.capacity, // Use capacity from body
      features: req.body.features || [], // Use features from body
      status: req.body.status ? req.body.status.toLowerCase() : 'active',
      currentLocation: req.body.location || 'Unknown', // Map location to currentLocation
      batteryLevel: req.body.batteryLevel,
    });

    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vehicle
router.patch('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Assign only explicitly allowed updates to prevent unwanted changes
    const allowedUpdates = ['vehicleId', 'type', 'status', 'batteryLevel', 'location', 'model', 'capacity', 'features'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    updates.forEach((update) => {
      if (update === 'vehicleId') {
        vehicle.vehicleNumber = req.body.vehicleId; // Map vehicleId to vehicleNumber
      } else if (update === 'location') {
        vehicle.currentLocation = req.body.location; // Map location to currentLocation
      } else {
        vehicle[update] = req.body[update];
      }
    });

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vehicle
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await vehicle.deleteOne(); // Use deleteOne() instead of remove() for Mongoose 6+
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get maintenance predictions
router.get('/maintenance-predictions', auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    // Generate demo predictions (in a real system, this would use ML models)
    const predictions = vehicles.map(vehicle => {
      // Simulate different maintenance predictions
      const predictions = [
        {
          type: 'battery',
          component: 'Battery System',
          daysUntilMaintenance: Math.floor(Math.random() * 30) + 1,
          probability: Math.random()
        },
        {
          type: 'engine',
          component: 'Engine System',
          daysUntilMaintenance: Math.floor(Math.random() * 60) + 1,
          probability: Math.random()
        }
      ];

      return {
        vehicleId: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        probability: Math.max(...predictions.map(p => p.probability)),
        predictions
      };
    });

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vehicles by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    const vehicles = await Vehicle.find({ status: status.toLowerCase() })
      .populate('assignedDriver', 'name email')
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;