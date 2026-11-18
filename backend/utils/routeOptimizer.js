const axios = require('axios');

// Fetch alternative routes using Google Directions API
async function getAlternativeRoutes(origin, destination) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&alternatives=true&mode=driving&key=${apiKey}`;
    const response = await axios.get(url);
    return response.data.routes;
  } catch (error) {
    console.error('Error getting alternative routes:', error);
    return [];
  }
}

// Basic route scoring (shortest duration)
function calculateRouteScore(route) {
  // Use duration as the score (lower is better)
  return route.legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);
}

// Main route optimization function (no ML)
async function optimizeRoute({ delivery, trafficData, weatherData, roadblocks }) {
  try {
    // Get alternative routes
    const routes = await getAlternativeRoutes(
      delivery.pickupLocation,
      delivery.deliveryLocation
    );
    if (!routes.length) {
      throw new Error('No routes found');
    }
    // Score each route by duration
    const scoredRoutes = routes.map(route => ({
      route,
      score: calculateRouteScore(route)
    }));
    // Sort routes by score (shortest duration first)
    scoredRoutes.sort((a, b) => a.score - b.score);
    // Get the best route
    const bestRoute = scoredRoutes[0].route;
    // Prepare response
    return {
      directions: bestRoute,
      score: scoredRoutes[0].score,
      alternatives: scoredRoutes.slice(1).map(({ route, score }) => ({ route, score })),
      factors: {
        traffic: trafficData,
        weather: weatherData,
        roadblocks
      }
    };
  } catch (error) {
    console.error('Error optimizing route:', error);
    throw error;
  }
}

module.exports = {
  optimizeRoute
}; 