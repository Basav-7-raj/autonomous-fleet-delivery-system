const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store io instance in app for use in routes
app.set('io', io);
global.io = io;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Handle real-time notifications
  socket.on('newNotification', (data) => {
    io.emit('notification', data);
  });

  // Handle emergency alerts
  socket.on('emergencyAlert', (data) => {
    io.emit('alert', data);
  });
});

// Import routes
const vehicleRoutes = require('./routes/vehicles');
const deliveryRoutes = require('./routes/deliveries');
const damageRoutes = require('./routes/damage');
const emergencyRoutes = require('./routes/emergency');
const feedbackRoutes = require('./routes/feedback');
const userRoutes = require('./routes/users');
const vehicleTypeRoutes = require('./routes/vehicleTypes');
const emergencyAlertRoutes = require('./routes/emergencyAlerts');
const emergencyVehicleRoutes = require('./routes/emergencyVehicles');
const emergencyLocationsRouter = require('./routes/emergencyLocations');
const accidentLocationsRouter = require('./routes/accidentLocations');

// Use routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/damage', damageRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/emergency-alerts', emergencyAlertRoutes);
app.use('/api/emergency-vehicles', emergencyVehicleRoutes);
app.use('/api/emergency-locations', emergencyLocationsRouter);
app.use('/api/accident-locations', accidentLocationsRouter);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// Register general routes (for /api/route and others)
const generalRoutes = require('./routes/routes');
app.use('/api/routes', generalRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Vehicle Management Backend is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 