const mongoose = require('mongoose');

const emergencyVehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['AMBULANCE', 'POLICE', 'FIRE_TRUCK', 'RESCUE_VEHICLE']
  },
  status: {
    type: String,
    required: true,
    enum: ['AVAILABLE', 'ON_DUTY', 'MAINTENANCE'],
    default: 'AVAILABLE'
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  crew: [{
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['DRIVER', 'PARAMEDIC', 'OFFICER', 'FIREFIGHTER', 'RESCUE_SPECIALIST']
    },
    contact: {
      type: String,
      required: true
    }
  }],
  equipment: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  lastMaintenance: {
    type: Date,
    required: true
  },
  nextMaintenance: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
emergencyVehicleSchema.index({ type: 1, status: 1 });
emergencyVehicleSchema.index({ vehicleId: 1 });

const EmergencyVehicle = mongoose.models.EmergencyVehicle || mongoose.model('EmergencyVehicle', emergencyVehicleSchema);

module.exports = EmergencyVehicle; 