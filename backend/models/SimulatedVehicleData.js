const mongoose = require('mongoose');

const simulatedVehicleDataSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  speed: {
    type: Number,
    required: true
  },
  battery: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['in_transit', 'idle', 'charging', 'offline', 'completed'],
    required: true
  },
  start: {
    lat: Number,
    lng: Number
  },
  end: {
    lat: Number,
    lng: Number
  },
  t: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  path: [
    {
      lat: Number,
      lng: Number
    }
  ]
});

const SimulatedVehicleData = mongoose.model('SimulatedVehicleData', simulatedVehicleDataSchema);

module.exports = mongoose.models.SimulatedVehicleData || mongoose.model('SimulatedVehicleData', simulatedVehicleDataSchema); 