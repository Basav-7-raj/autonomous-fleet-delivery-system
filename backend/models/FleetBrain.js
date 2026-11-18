// backend/models/FleetBrain.js - CREATE THIS FILE
const mongoose = require('mongoose');

const fleetBrainSchema = new mongoose.Schema({
  decisionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  decisionType: {
    type: String,
    enum: ['ROUTE_OPTIMIZATION', 'VEHICLE_ASSIGNMENT', 'BATTERY_MANAGEMENT', 'EMERGENCY_RESPONSE', 'MAINTENANCE_SCHEDULING'],
    required: true
  },
  input: {
    vehicles: [{
      vehicleId: String,
      batteryLevel: Number,
      location: { lat: Number, lng: Number },
      status: String,
      load: Number,
      driverStress: Number
    }],
    deliveries: [{
      deliveryId: String,
      priority: String,
      location: { lat: Number, lng: Number },
      deadline: Date,
      weight: Number
    }],
    environment: {
      weather: String,
      trafficLevel: Number,
      carbonFootprint: Number
    }
  },
  decision: {
    action: String,
    reasoning: String,
    confidence: Number,
    expectedOutcome: String,
    carbonSavings: Number,
    timeSaved: Number
  },
  result: {
    success: Boolean,
    actualOutcome: String,
    feedback: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FleetBrain', fleetBrainSchema);