const express = require('express');
const router = express.Router();
const AccidentLocation = require('../models/AccidentLocation');

// Get all accident locations
router.get('/', async (req, res) => {
  try {
    const locations = await AccidentLocation.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new accident location
router.post('/', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const newLocation = new AccidentLocation({ lat, lng });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;