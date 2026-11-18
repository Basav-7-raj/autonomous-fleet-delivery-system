require('dotenv').config();
const mongoose = require('mongoose');
const SimulatedVehicleData = require('../models/SimulatedVehicleData');
const polyline = require('polyline');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

function getNextIndex(path, t) {
  // t is the current index in the path array
  if (!Array.isArray(path) || path.length === 0) return 0;
  let nextIndex = t + 1;
  if (nextIndex >= path.length) nextIndex = path.length - 1;
  return nextIndex;
}

// Main simulation function
async function simulate() {
  try {
    setInterval(async () => {
      // Get the latest state for each vehicle that is not completed
      const vehicles = await SimulatedVehicleData.aggregate([
        { $sort: { timestamp: -1 } },
        { $group: { _id: "$vehicleId", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $match: { completed: false } }
      ], { allowDiskUse: true });

      console.log('Vehicles to simulate:', vehicles.map(v => v.vehicleId));

      for (const v of vehicles) {
        // If path exists and has more than one point, move along the path
        let t = typeof v.t === 'number' ? v.t : 0;
        let nextIndex = getNextIndex(v.path, t);
        let completed = false;
        if (nextIndex >= v.path.length - 1) {
          completed = true;
        }
        const location = v.path[nextIndex];
        const speed = completed ? 0 : Math.floor(Math.random() * 40) + 20;
        const battery = Math.floor(Math.random() * 50) + 50;
        const status = completed ? 'completed' : 'in_transit';

        await SimulatedVehicleData.create({
          vehicleId: v.vehicleId,
          timestamp: new Date(),
          location,
          speed,
          battery,
          status,
          start: v.start,
          end: v.end,
          t: nextIndex,
          completed,
          path: v.path
        });

        console.log('Simulated data updated for:', v.vehicleId, 't:', nextIndex, 'completed:', completed);
      }
    }, 2000); // Every 2 seconds
  } catch (error) {
    console.error('Simulation error:', error.message);
  }
}

// Start simulation
simulate();
