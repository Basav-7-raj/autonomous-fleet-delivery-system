const express = require('express');
const router = express.Router();
const EmergencyVehicle = require('../models/EmergencyVehicle');

// Get all emergency vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await EmergencyVehicle.find()
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available emergency vehicles
router.get('/available', async (req, res) => {
  try {
    const vehicles = await EmergencyVehicle.find({ status: 'AVAILABLE' });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new emergency vehicle
router.post('/', async (req, res) => {
  const vehicle = new EmergencyVehicle(req.body);
  try {
    const newVehicle = await vehicle.save();
    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an emergency vehicle
router.patch('/:id', async (req, res) => {
  try {
    const vehicle = await EmergencyVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    Object.assign(vehicle, req.body);
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vehicle status
router.patch('/:id/status', async (req, res) => {
  try {
    const vehicle = await EmergencyVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    vehicle.status = req.body.status;
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get emergency vehicles by type
router.get('/type/:type', async (req, res) => {
  try {
    const vehicles = await EmergencyVehicle.find({ type: req.params.type });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 