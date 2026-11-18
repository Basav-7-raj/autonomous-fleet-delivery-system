const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://autonomous-vehicle-lyze.onrender.com';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`,
  
  // Vehicles
  VEHICLES: `${API_BASE_URL}/api/vehicles`,
  VEHICLE_SIMULATION: `${API_BASE_URL}/api/vehicles/simulate`,
  VEHICLE_MAINTENANCE: `${API_BASE_URL}/api/vehicles/maintenance-predictions`,
  
  // Deliveries
  DELIVERIES: `${API_BASE_URL}/api/deliveries`,
  
  // Damage
  DAMAGE: `${API_BASE_URL}/api/damage`,
  
  // Emergency
  EMERGENCY: `${API_BASE_URL}/api/emergency`,
  EMERGENCY_ALERTS: `${API_BASE_URL}/api/emergency-alerts`,
  EMERGENCY_VEHICLES: `${API_BASE_URL}/api/emergency-vehicles`,
  EMERGENCY_LOCATIONS: `${API_BASE_URL}/api/emergency-locations`,
  
  // Feedback
  FEEDBACK: `${API_BASE_URL}/api/feedback`,
  
  // Vehicle Types
  VEHICLE_TYPES: `${API_BASE_URL}/api/vehicle-types`,
  
  // Routes
  ROUTES: `${API_BASE_URL}/api/routes`,
  
  // Accident Locations
  ACCIDENT_LOCATIONS: `${API_BASE_URL}/api/accident-locations`,
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      status: 500,
    };
  }
}; 