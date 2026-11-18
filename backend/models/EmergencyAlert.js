const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: ['ACCIDENT', 'BREAKDOWN', 'MEDICAL', 'SECURITY']
  },
  severity: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH']
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'RESOLVED'],
    default: 'ACTIVE'
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
  capturedImages: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  batteryLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  speed: {
    type: Number,
    required: true,
    min: 0
  },
  driver: {
    name: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    },
    license: {
      type: String,
      required: true
    }
  },
  responders: [{
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Medical', 'Security', 'Mechanical', 'Emergency']
    },
    status: {
      type: String,
      required: true,
      enum: ['En Route', 'On Scene', 'Completed']
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
emergencyAlertSchema.index({ timestamp: -1 });
emergencyAlertSchema.index({ status: 1, type: 1 });

const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);

module.exports = mongoose.models.EmergencyAlert || mongoose.model('EmergencyAlert', emergencyAlertSchema); 