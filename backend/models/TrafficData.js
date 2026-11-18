const mongoose = require('mongoose');

const trafficDataSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['low', 'medium', 'high', 'severe'],
    required: true
  },
  affectedAreas: [{
    type: String,
    required: true
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['google_maps', 'manual', 'sensor'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  }
});

const TrafficData = mongoose.model('TrafficData', trafficDataSchema);

module.exports = mongoose.models.TrafficData || mongoose.model('TrafficData', trafficDataSchema); 