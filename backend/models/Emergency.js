const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  alertType: {
    type: String,
    enum: ['Accident', 'Breakdown', 'Medical Emergency', 'Security Threat', 'Other'],
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'Investigating'],
    default: 'Active',
  },
  description: {
    type: String,
    trim: true,
  },
  responders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

const Emergency = mongoose.models.Emergency || mongoose.model('Emergency', emergencySchema);

module.exports = Emergency; 