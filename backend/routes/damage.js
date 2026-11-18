const express = require('express');
const router = express.Router();
const Damage = require('../models/Damage');
const Vehicle = require('../models/Vehicle'); // Assuming Vehicle model is needed for populating
const User = require('../models/User'); // Assuming User model is needed for populating mechanic
const auth = require('../middleware/auth');

// Get all damage reports
router.get('/', auth, async (req, res) => {
  try {
    const damageReports = await Damage.find()
      .populate('vehicleId', 'vehicleNumber type')
      .populate('assignedMechanic', 'name email')
      .sort({ createdAt: -1 });
    res.json(damageReports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single damage report by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const damageReport = await Damage.findById(req.params.id)
      .populate('vehicleId', 'vehicleNumber type')
      .populate('assignedMechanic', 'name email');
    if (!damageReport) {
      return res.status(404).json({ message: 'Damage report not found' });
    }
    res.json(damageReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new damage report

router.post('/', auth, async (req, res) => {
  try {
    const newDamageReport = new Damage(req.body);
    await newDamageReport.save();
    res.status(201).json(newDamageReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a damage report
router.patch('/:id', auth, async (req, res) => {
  try {
    const updatedDamageReport = await Damage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('vehicleId', 'vehicleNumber type')
      .populate('assignedMechanic', 'name email');

    if (!updatedDamageReport) {
      return res.status(404).json({ message: 'Damage report not found' });
    }
    res.json(updatedDamageReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a damage report
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedDamageReport = await Damage.findByIdAndDelete(req.params.id);
    if (!deletedDamageReport) {
      return res.status(404).json({ message: 'Damage report not found' });
    }
    res.json({ message: 'Damage report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 