// backend/routes/aiRoutes.js - ULTRA-REALISTIC VERSION
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const Delivery = require('../models/delivery');

// Ultra-realistic demo data with real scenarios
const demoVehicles = [
  { 
    id: 'V-001', 
    name: 'Swift Delivery Van', 
    battery: 85, 
    location: 'Bangalore Tech Park', 
    status: 'active', 
    load: 60,
    driver: 'Rajesh Kumar',
    lastMaintenance: '2025-01-15',
    efficiency: 92
  },
  { 
    id: 'V-002', 
    name: 'Eco-Friendly Truck', 
    battery: 45, 
    location: 'Mumbai Airport Terminal 2', 
    status: 'active', 
    load: 80,
    driver: 'Priya Sharma',
    lastMaintenance: '2025-01-10',
    efficiency: 88
  },
  { 
    id: 'V-003', 
    name: 'Express Delivery Van', 
    battery: 25, 
    location: 'Delhi Metro Station', 
    status: 'active', 
    load: 40,
    driver: 'Amit Singh',
    lastMaintenance: '2025-01-18',
    efficiency: 95
  },
  { 
    id: 'V-004', 
    name: 'Heavy Duty Truck', 
    battery: 90, 
    location: 'Chennai Port', 
    status: 'active', 
    load: 20,
    driver: 'Suresh Reddy',
    lastMaintenance: '2025-01-20',
    efficiency: 90
  },
  { 
    id: 'V-005', 
    name: 'Smart Delivery Van', 
    battery: 65, 
    location: 'Kolkata Howrah Station', 
    status: 'active', 
    load: 70,
    driver: 'Deepak Das',
    lastMaintenance: '2025-01-12',
    efficiency: 87
  }
];

const demoDeliveries = [
  { 
    id: 'DEL-001', 
    customer: 'John Doe', 
    company: 'TechCorp India',
    location: 'Bangalore Tech Park, Block A', 
    priority: 'HIGH', 
    status: 'PENDING',
    weight: 15,
    estimatedTime: 45,
    value: 25000
  },
  { 
    id: 'DEL-002', 
    customer: 'Sarah Smith', 
    company: 'Fashion Hub',
    location: 'Mumbai Business District, Tower B', 
    priority: 'MEDIUM', 
    status: 'PENDING',
    weight: 8,
    estimatedTime: 30,
    value: 15000
  },
  { 
    id: 'DEL-003', 
    customer: 'Mike Johnson', 
    company: 'Electronics Store',
    location: 'Delhi Shopping Mall, Floor 3', 
    priority: 'URGENT', 
    status: 'PENDING',
    weight: 25,
    estimatedTime: 60,
    value: 45000
  },
  { 
    id: 'DEL-004', 
    customer: 'Lisa Brown', 
    company: 'IT Solutions',
    location: 'Chennai IT Hub, Building C', 
    priority: 'LOW', 
    status: 'PENDING',
    weight: 5,
    estimatedTime: 25,
    value: 8000
  },
  { 
    id: 'DEL-005', 
    customer: 'David Wilson', 
    company: 'Retail Chain',
    location: 'Kolkata Market, Shop 45', 
    priority: 'HIGH', 
    status: 'PENDING',
    weight: 12,
    estimatedTime: 35,
    value: 18000
  }
];

// Real-time traffic and weather data
const trafficConditions = [
  { location: 'MG Road, Bangalore', condition: 'Heavy Traffic', delay: 25 },
  { location: 'Bandra Kurla Complex, Mumbai', condition: 'Moderate Traffic', delay: 15 },
  { location: 'Connaught Place, Delhi', condition: 'Light Traffic', delay: 5 },
  { location: 'Anna Salai, Chennai', condition: 'Heavy Traffic', delay: 30 },
  { location: 'Park Street, Kolkata', condition: 'Moderate Traffic', delay: 20 }
];

const weatherConditions = [
  { location: 'Bangalore', condition: 'Sunny', temperature: 28, impact: 'None' },
  { location: 'Mumbai', condition: 'Rainy', temperature: 24, impact: 'Moderate' },
  { location: 'Delhi', condition: 'Foggy', temperature: 18, impact: 'High' },
  { location: 'Chennai', condition: 'Humid', temperature: 32, impact: 'Low' },
  { location: 'Kolkata', condition: 'Cloudy', temperature: 26, impact: 'None' }
];

// Get ultra-realistic AI insights
router.get('/insights', auth, async (req, res) => {
  try {
    const currentHour = new Date().getHours();
    const isPeakHour = currentHour >= 8 && currentHour <= 10 || currentHour >= 17 && currentHour <= 19;
    
    const insights = {
      fleetEfficiency: Math.floor(Math.random() * 10) + 90, // 90-100%
      carbonSavings: (Math.random() * 20 + 15).toFixed(1), // 15-35kg
      totalDecisions: Math.floor(Math.random() * 200) + 150, // 150-350
      activeVehicles: demoVehicles.length,
      pendingDeliveries: demoDeliveries.length,
      averageBattery: Math.floor(Math.random() * 15) + 75, // 75-90%
      routesOptimized: Math.floor(Math.random() * 30) + 25, // 25-55
      timeSaved: Math.floor(Math.random() * 40) + 30, // 30-70 minutes
      fuelSaved: (Math.random() * 15 + 10).toFixed(1), // 10-25 liters
      customerSatisfaction: Math.floor(Math.random() * 10) + 90, // 90-100%
      onTimeDelivery: Math.floor(Math.random() * 8) + 92, // 92-100%
      peakHourEfficiency: isPeakHour ? Math.floor(Math.random() * 15) + 80 : Math.floor(Math.random() * 10) + 90,
      maintenanceAlerts: Math.floor(Math.random() * 3) + 1, // 1-3 alerts
      emergencyResponses: Math.floor(Math.random() * 5) + 2 // 2-6 responses
    };
    
    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Make ultra-realistic AI decision
router.post('/decision', auth, async (req, res) => {
  try {
    const { decisionType } = req.body;
    
    // Generate ultra-realistic AI decisions with real scenarios
    const decisions = {
      'ROUTE_OPTIMIZATION': {
        action: `�� AI Optimized Route for ${demoVehicles[Math.floor(Math.random() * demoVehicles.length)].name}`,
        reasoning: `Smart routing algorithm detected traffic jam on MG Road (25min delay). Suggested alternative route via Outer Ring Road. Real-time traffic data shows 15km shorter path with 20 minutes time savings.`,
        confidence: Math.floor(Math.random() * 10) + 90, // 90-100%
        timeSaved: Math.floor(Math.random() * 25) + 20, // 20-45 minutes
        fuelSaved: (Math.random() * 4 + 3).toFixed(1), // 3-7 liters
        carbonSavings: (Math.random() * 2 + 1.5).toFixed(1), // 1.5-3.5kg
        routeDetails: {
          originalRoute: 'MG Road → Brigade Road → Destination',
          optimizedRoute: 'Outer Ring Road → Silk Board → Destination',
          distanceSaved: '15km',
          trafficAvoided: 'Heavy traffic on MG Road'
        }
      },
      'VEHICLE_ASSIGNMENT': {
        action: `�� AI Assigned ${demoVehicles[Math.floor(Math.random() * demoVehicles.length)].name} to ${demoDeliveries[Math.floor(Math.random() * demoDeliveries.length)].id}`,
        reasoning: `Intelligent matching algorithm selected optimal vehicle based on: 85% battery level, 2km distance from pickup, driver efficiency score 92%, and vehicle capacity match. Estimated delivery time: 35 minutes.`,
        confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
        timeSaved: Math.floor(Math.random() * 20) + 15, // 15-35 minutes
        fuelSaved: (Math.random() * 3 + 2).toFixed(1), // 2-5 liters
        carbonSavings: (Math.random() * 1.5 + 1).toFixed(1), // 1-2.5kg
        assignmentDetails: {
          vehicle: demoVehicles[Math.floor(Math.random() * demoVehicles.length)].name,
          driver: demoVehicles[Math.floor(Math.random() * demoVehicles.length)].driver,
          delivery: demoDeliveries[Math.floor(Math.random() * demoDeliveries.length)].id,
          customer: demoDeliveries[Math.floor(Math.random() * demoDeliveries.length)].customer,
          estimatedTime: '35 minutes'
        }
      },
      'BATTERY_MANAGEMENT': {
        action: `🔋 AI Battery Alert: ${demoVehicles[Math.floor(Math.random() * demoVehicles.length)].name} needs charging`,
        reasoning: `Predictive battery management detected 25% battery level. Next delivery is 40km away requiring 30% battery. Nearest charging station is 2km away with 15-minute charging time. Proactive action prevents delivery delays.`,
        confidence: 98,
        timeSaved: 0,
        fuelSaved: 0,
        carbonSavings: 0,
        batteryDetails: {
          currentLevel: '25%',
          requiredForNextDelivery: '30%',
          nearestChargingStation: '2km away',
          chargingTime: '15 minutes',
          driver: demoVehicles[Math.floor(Math.random() * demoVehicles.length)].driver
        }
      },
      'EMERGENCY_RESPONSE': {
        action: `🚨 AI Emergency Response: ${demoVehicles[Math.floor(Math.random() * demoVehicles.length)].name} reported incident`,
        reasoning: `Emergency detection system activated. Vehicle reported minor accident on Highway 47. Nearest emergency vehicle dispatched with medical supplies. ETA: 8 minutes. Traffic management system alerted for route clearance.`,
        confidence: 99,
        timeSaved: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
        fuelSaved: 0,
        carbonSavings: 0,
        emergencyDetails: {
          incidentType: 'Minor Accident',
          location: 'Highway 47, Km 15',
          severity: 'Low',
          responseTime: '8 minutes',
          emergencyVehicle: 'EM-001',
          medicalSupplies: 'Available'
        }
      },
      'PREDICTIVE_MAINTENANCE': {
        action: `🔧 AI Predictive Maintenance: ${demoVehicles[Math.floor(Math.random() * demoVehicles.length)].name} needs service`,
        reasoning: `Machine learning algorithm detected unusual vibration patterns and engine performance degradation. Predictive maintenance model suggests brake pad replacement and engine oil change within 500km. Preventive action prevents breakdown.`,
        confidence: 94,
        timeSaved: Math.floor(Math.random() * 30) + 20, // 20-50 minutes
        fuelSaved: (Math.random() * 2 + 1).toFixed(1), // 1-3 liters
        carbonSavings: (Math.random() * 1 + 0.5).toFixed(1), // 0.5-1.5kg
        maintenanceDetails: {
          issue: 'Brake pad wear detected',
          severity: 'Medium',
          estimatedCost: '₹2,500',
          recommendedAction: 'Schedule maintenance within 500km',
          lastService: '15 days ago'
        }
      }
    };
    
    const decision = decisions[decisionType] || decisions['ROUTE_OPTIMIZATION'];
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('aiDecision', {
        type: decisionType,
        decision: decision,
        timestamp: new Date(),
        vehicleId: demoVehicles[Math.floor(Math.random() * demoVehicles.length)].id,
        deliveryId: demoDeliveries[Math.floor(Math.random() * demoDeliveries.length)].id
      });
    }
    
    res.json(decision);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Simulate ultra-realistic swarm intelligence updates
router.post('/swarm-update', auth, async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    const swarmUpdates = [
      {
        vehicleId: vehicleId || demoVehicles[Math.floor(Math.random() * demoVehicles.length)].id,
        data: {
          type: 'traffic_update',
          message: 'Heavy traffic detected on MG Road. Alternative route via Outer Ring Road suggested.',
          location: 'MG Road, Bangalore',
          severity: 'high',
          impact: '25 minutes delay',
          alternativeRoute: 'Outer Ring Road → Silk Board',
          timeSaved: '20 minutes'
        },
        timestamp: new Date()
      },
      {
        vehicleId: vehicleId || demoVehicles[Math.floor(Math.random() * demoVehicles.length)].id,
        data: {
          type: 'weather_update',
          message: 'Heavy rain detected in Mumbai area. Suggesting slower speed and increased following distance.',
          location: 'Mumbai Airport',
          severity: 'medium',
          impact: '15 minutes delay',
          recommendation: 'Reduce speed by 20%',
          safetyLevel: 'High'
        },
        timestamp: new Date()
      },
      {
        vehicleId: vehicleId || demoVehicles[Math.floor(Math.random() * demoVehicles.length)].id,
        data: {
          type: 'battery_alert',
          message: 'Low battery warning. Nearest charging station 2km away with 4 available slots.',
          location: 'Delhi Metro Station',
          severity: 'high',
          impact: 'Immediate action required',
          chargingStation: 'Delhi Metro Charging Hub',
          availableSlots: 4,
          estimatedChargingTime: '15 minutes'
        },
        timestamp: new Date()
      },
      {
        vehicleId: vehicleId || demoVehicles[Math.floor(Math.random() * demoVehicles.length)].id,
        data: {
          type: 'delivery_update',
          message: 'Customer not available at delivery location. Rescheduling for 2 PM today.',
          location: 'Chennai IT Hub',
          severity: 'low',
          impact: 'Delivery rescheduled',
          newTime: '2:00 PM',
          customerContact: 'Available'
        },
        timestamp: new Date()
      },
      {
        vehicleId: vehicleId || demoVehicles[Math.floor(Math.random() * demoVehicles.length)].id,
        data: {
          type: 'route_optimization',
          message: 'New route discovered that saves 12km and 18 minutes. Sharing with fleet.',
          location: 'Kolkata Howrah Station',
          severity: 'low',
          impact: 'Route optimization',
          distanceSaved: '12km',
          timeSaved: '18 minutes',
          fuelSaved: '2.5L'
        },
        timestamp: new Date()
      }
    ];
    
    const update = swarmUpdates[Math.floor(Math.random() * swarmUpdates.length)];
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('swarmUpdate', update);
    }
    
    res.json(update);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;