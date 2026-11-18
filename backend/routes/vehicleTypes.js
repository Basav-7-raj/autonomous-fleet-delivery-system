const express = require('express');
const router = express.Router();
const VehicleType = require('../models/VehicleType');
const auth = require('../middleware/auth');

// Get all vehicle types
router.get('/', async (req, res) => {
  try {
    const vehicleTypes = await VehicleType.find();
    res.json(vehicleTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new vehicle type
router.post('/', auth, async (req, res) => {
  const vehicleType = new VehicleType({
    name: req.body.name,
    capacity: req.body.capacity,
    features: req.body.features || [],
    suitableFor: req.body.suitableFor || [],
    image: req.body.image || '/placeholder-car.webp',
  });

  try {
    const newVehicleType = await vehicleType.save();
    res.status(201).json(newVehicleType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vehicle type
router.patch('/:id', auth, async (req, res) => {
  try {
    const vehicleType = await VehicleType.findById(req.params.id);
    if (!vehicleType) {
      return res.status(404).json({ message: 'Vehicle type not found' });
    }

    Object.assign(vehicleType, req.body);

    const updatedVehicleType = await vehicleType.save();
    res.json(updatedVehicleType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vehicle type
router.delete('/:id', auth, async (req, res) => {
  try {
    const vehicleType = await VehicleType.findById(req.params.id);
    if (!vehicleType) {
      return res.status(404).json({ message: 'Vehicle type not found' });
    }

    await vehicleType.deleteOne(); // Use deleteOne() instead of remove() for Mongoose 6+
    res.json({ message: 'Vehicle type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 