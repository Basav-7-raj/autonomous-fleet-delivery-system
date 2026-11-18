// backend/utils/aiFleetBrain.js - CREATE THIS FILE
const FleetBrain = require('../models/FleetBrain');
const Vehicle = require('../models/Vehicle');
const Delivery = require('../models/delivery');

class AIFleetBrain {
  constructor() {
    this.decisionHistory = [];
    this.learningData = [];
  }

  // Main AI Decision Engine
  async makeFleetDecision(decisionType, context) {
    try {
      console.log(`🧠 AI Fleet Brain: Making ${decisionType} decision...`);
      
      const decision = await this.processDecision(decisionType, context);
      
      // Store decision in database
      const fleetBrainRecord = new FleetBrain({
        decisionId: `DEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        decisionType,
        input: context,
        decision: decision
      });

      await fleetBrainRecord.save();
      
      // Emit real-time decision to frontend
      if (global.io) {
        global.io.emit('aiDecision', {
          type: decisionType,
          decision: decision,
          timestamp: new Date(),
          decisionId: fleetBrainRecord.decisionId
        });
      }

      console.log(`✅ AI Decision made: ${decision.action}`);
      return decision;
    } catch (error) {
      console.error('❌ AI Fleet Brain Error:', error);
      return null;
    }
  }

  // Route Optimization with Carbon Footprint
  async optimizeRouteWithEcoFriendly(deliveries, vehicles) {
    const routes = [];
    
    for (const delivery of deliveries) {
      const availableVehicles = vehicles.filter(v => 
        v.status === 'active' && 
        v.batteryLevel > 30 && 
        v.load < v.capacity
      );

      if (availableVehicles.length === 0) continue;

      // AI Logic: Choose vehicle with best eco-score
      const bestVehicle = availableVehicles.reduce((best, current) => {
        const currentScore = this.calculateEcoScore(current, delivery);
        const bestScore = this.calculateEcoScore(best, delivery);
        return currentScore > bestScore ? current : best;
      });

      const route = {
        vehicleId: bestVehicle.vehicleId,
        deliveryId: delivery.deliveryId,
        route: await this.calculateOptimalRoute(bestVehicle.location, delivery.location),
        carbonFootprint: this.calculateCarbonFootprint(bestVehicle, delivery),
        estimatedTime: this.estimateDeliveryTime(bestVehicle, delivery),
        ecoScore: this.calculateEcoScore(bestVehicle, delivery)
      };

      routes.push(route);
    }

    return routes;
  }

  // Calculate Eco-Friendly Score
  calculateEcoScore(vehicle, delivery) {
    const batteryScore = vehicle.batteryLevel / 100;
    const distanceScore = 1 / (this.calculateDistance(vehicle.location, delivery.location) + 1);
    const loadScore = 1 - (vehicle.load / vehicle.capacity);
    const stressScore = 1 - (vehicle.driverStress / 100);

    return (batteryScore * 0.3 + distanceScore * 0.3 + loadScore * 0.2 + stressScore * 0.2) * 100;
  }

  // Swarm Intelligence: Vehicle Communication
  async swarmIntelligenceUpdate(vehicleId, update) {
    const swarmUpdate = {
      vehicleId,
      timestamp: new Date(),
      data: update,
      sharedWith: []
    };

    // Broadcast to nearby vehicles
    if (global.io) {
      global.io.emit('swarmUpdate', swarmUpdate);
    }

    return swarmUpdate;
  }

  // Emergency Response AI
  async emergencyResponse(emergencyData) {
    const nearbyVehicles = await this.findNearbyVehicles(emergencyData.location, 5);
    
    const response = {
      emergencyId: emergencyData.id,
      assignedVehicles: [],
      estimatedResponseTime: 0,
      actionPlan: []
    };

    for (const vehicle of nearbyVehicles) {
      if (vehicle.status === 'active' && vehicle.batteryLevel > 20) {
        response.assignedVehicles.push({
          vehicleId: vehicle.vehicleId,
          estimatedArrival: this.calculateArrivalTime(vehicle.location, emergencyData.location),
          capability: this.assessVehicleCapability(vehicle, emergencyData.type)
        });
      }
    }

    response.assignedVehicles.sort((a, b) => a.estimatedArrival - b.estimatedArrival);
    response.estimatedResponseTime = response.assignedVehicles[0]?.estimatedArrival || 0;

    return response;
  }

  // Helper methods
  calculateDistance(loc1, loc2) {
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateCarbonFootprint(vehicle, delivery) {
    const distance = this.calculateDistance(vehicle.location, delivery.location);
    const baseEmission = 0.12;
    const loadFactor = 1 + (vehicle.load / vehicle.capacity) * 0.2;
    return distance * baseEmission * loadFactor;
  }

  async processDecision(decisionType, context) {
    switch (decisionType) {
      case 'ROUTE_OPTIMIZATION':
        return await this.optimizeRouteWithEcoFriendly(context.deliveries, context.vehicles);
      case 'EMERGENCY_RESPONSE':
        return await this.emergencyResponse(context.emergency);
      case 'BATTERY_MANAGEMENT':
        return await this.optimizeBatteryUsage(context.vehicles);
      default:
        return { action: 'NO_ACTION', reasoning: 'Unknown decision type' };
    }
  }

  // Additional helper methods
  async findNearbyVehicles(location, radius) {
    // This would query your database for vehicles within radius
    return await Vehicle.find({ status: 'active' }).limit(10);
  }

  calculateArrivalTime(vehicleLocation, destination) {
    const distance = this.calculateDistance(vehicleLocation, destination);
    return Math.round(distance * 2); // 2 minutes per km
  }

  assessVehicleCapability(vehicle, emergencyType) {
    // Simple capability assessment
    return {
      medical: vehicle.type === 'Medical Vehicle',
      security: vehicle.type === 'Security Vehicle',
      general: true
    };
  }

  async optimizeBatteryUsage(vehicles) {
    return {
      action: 'Battery optimization scheduled',
      reasoning: 'Vehicles with low battery will be charged during off-peak hours',
      confidence: 85
    };
  }

  estimateDeliveryTime(vehicle, delivery) {
    const distance = this.calculateDistance(vehicle.location, delivery.location);
    return Math.round(distance * 2); // 2 minutes per km
  }

  async calculateOptimalRoute(start, end) {
    // This would integrate with your existing route API
    return [
      { lat: start.lat, lng: start.lng },
      { lat: end.lat, lng: end.lng }
    ];
  }
}

module.exports = new AIFleetBrain();