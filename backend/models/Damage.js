const mongoose = require('mongoose');

const damageSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  damageDescription: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  },
  damageImages: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  assignedMechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  estimatedRepairTime: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

const Damage = mongoose.models.Damage || mongoose.model('Damage', damageSchema);

module.exports = Damage; 