const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const Vehicle = require('../models/Vehicle'); // Assuming Vehicle model is needed for populating
const User = require('../models/User'); // Assuming User model is needed for populating responders
const auth = require('../middleware/auth');

// Get all emergency alerts
router.get('/', auth, async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate('vehicleId', 'vehicleNumber type')
      .populate('responders', 'name email')
      .sort({ timestamp: -1 });
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single emergency alert by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('vehicleId', 'vehicleNumber type')
      .populate('responders', 'name email');
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency alert not found' });
    }
    res.json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new emergency alert
router.post('/', auth, async (req, res) => {
  try {
    const newEmergency = new Emergency(req.body);
    await newEmergency.save();
    res.status(201).json(newEmergency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an emergency alert
router.patch('/:id', auth, async (req, res) => {
  try {
    const updatedEmergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('vehicleId', 'vehicleNumber type')
      .populate('responders', 'name email');

    if (!updatedEmergency) {
      return res.status(404).json({ message: 'Emergency alert not found' });
    }
    res.json(updatedEmergency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an emergency alert
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedEmergency = await Emergency.findByIdAndDelete(req.params.id);
    if (!deletedEmergency) {
      return res.status(404).json({ message: 'Emergency alert not found' });
    }
    res.json({ message: 'Emergency alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 