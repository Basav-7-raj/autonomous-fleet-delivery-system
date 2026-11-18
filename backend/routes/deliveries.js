const express = require('express');
const router = express.Router();
const Delivery = require('../models/delivery');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all deliveries
router.get('/', auth, async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('vehicleId', 'vehicleNumber type')
      .populate('driverId', 'name email')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single delivery by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('vehicleId', 'vehicleNumber type')
      .populate('driverId', 'name email');
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new delivery
router.post('/', auth, async (req, res) => {
  try {
    const {
      deliveryId,
      customerName,
      address,
      status,
      vehicleId,
      driverId,
      priority,
      estimatedDelivery,
    } = req.body;

    const newDelivery = new Delivery({
      deliveryId,
      customerName,
      address,
      status,
      vehicleId: vehicleId || null, 
      driverId: driverId || null,
      priority,
      estimatedDelivery,
    });

    await newDelivery.save();
    res.status(201).json(newDelivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a delivery
router.patch('/:id', auth, async (req, res) => {
  try {
    const {
      deliveryId,
      customerName,
      address,
      status,
      vehicleId,
      driverId,
      priority,
      estimatedDelivery,
      verificationImages,
      customerSignature,
    } = req.body;

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        deliveryId,
        customerName,
        address,
        status,
        vehicleId: vehicleId || null, 
        driverId: driverId || null,
        priority,
        estimatedDelivery,
        verificationImages,
        customerSignature,
      },
      { new: true, runValidators: true }
    )
      .populate('vehicleId', 'vehicleNumber type')
      .populate('driverId', 'name email');

    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json(updatedDelivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a delivery
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!deletedDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
