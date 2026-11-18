const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Standard Delivery Van', 'Refrigerated Truck', 'Hot Food Delivery Vehicle']
  },
  model: {
    type: String,
    required: false
  },
  capacity: {
    type: Number,
    required: false
  },
  features: [{
    type: String,
    enum: ['Temperature Control', 'Heated Storage', 'Cold Storage', 'Large Capacity', 'Standard Size']
  }],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'damaged', 'inactive'],
    default: 'active'
  },
  currentLocation: {
    type: String,
    default: 'Unknown',
  },
  lastLocationUpdate: {
    type: Date,
    default: Date.now,
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  images: [{
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    expiryDate: Date,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema); 