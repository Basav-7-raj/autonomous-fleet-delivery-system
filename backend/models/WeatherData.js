const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true
  },
  conditions: {
    type: String,
    enum: ['clear', 'cloudy', 'rainy', 'foggy', 'snowy'],
    required: true
  },
  visibility: {
    type: Number, // in kilometers
    required: true
  },
  precipitation: {
    type: Number, // in mm
    default: 0
  },
  windSpeed: {
    type: Number, // in km/h
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['weather_api', 'manual', 'sensor'],
    required: true
  }
});

const WeatherData = mongoose.model('WeatherData', weatherDataSchema);

module.exports = mongoose.models.WeatherData || mongoose.model('WeatherData', weatherDataSchema); 