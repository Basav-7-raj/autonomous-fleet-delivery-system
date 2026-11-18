const express = require('express');
const router = express.Router();
const EmergencyAlert = require('../models/EmergencyAlert');

// Get all emergency alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active emergency alerts
router.get('/active', async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ status: 'ACTIVE' })
      .sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new emergency alert
router.post('/', async (req, res) => {
  const alert = new EmergencyAlert(req.body);
  try {
    const newAlert = await alert.save();
    res.status(201).json(newAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an emergency alert
router.patch('/:id', async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    Object.assign(alert, req.body);
    const updatedAlert = await alert.save();
    res.json(updatedAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Resolve an emergency alert
router.patch('/:id/resolve', async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    alert.status = 'RESOLVED';
    const updatedAlert = await alert.save();
    res.json(updatedAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get emergency alerts by vehicle ID
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ vehicleId: req.params.vehicleId })
      .sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 