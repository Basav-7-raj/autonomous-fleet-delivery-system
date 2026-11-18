const mongoose = require('mongoose');

const vehicleTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  capacity: {
    type: String,
    required: true,
    enum: ['Small', 'Medium', 'Large', 'Extra Large'],
  },
  features: {
    type: [String],
    default: [],
  },
  suitableFor: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: '/placeholder-car.webp', // A default image for vehicle types
  },
}, {
  timestamps: true,
});

const VehicleType = mongoose.models.VehicleType || mongoose.model('VehicleType', vehicleTypeSchema);

module.exports = VehicleType; 