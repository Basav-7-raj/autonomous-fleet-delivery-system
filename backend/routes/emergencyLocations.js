const express = require('express');
const router = express.Router();
const EmergencyLocation = require('../models/EmergencyLocation');

// GET all emergency locations
router.get('/', async (req, res) => {
  try {
    const locations = await EmergencyLocation.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new emergency location
router.post('/', async (req, res) => {
  try {
    const { type, lat, lng } = req.body;
    const location = new EmergencyLocation({ type, lat, lng });
    await location.save();
    res.status(201).json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;