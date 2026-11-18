const mongoose = require('mongoose');

const emergencyLocationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('EmergencyLocation', emergencyLocationSchema);