// frontend/src/services/aiService.js - CREATE THIS FILE
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

const AI_BASE_URL = process.env.REACT_APP_API_URL || 'https://autonomous-vehicle-lyze.onrender.com';

export const aiService = {
  // Get AI decision history
  getDecisions: async () => {
    try {
      const response = await axios.get(`${AI_BASE_URL}/api/ai/decisions`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching AI decisions:', error);
      throw error;
    }
  },

  // Make AI decision
  makeDecision: async (decisionType, context) => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/api/ai/decision`, {
        decisionType,
        context
      }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error making AI decision:', error);
      throw error;
    }
  },

  // Get AI insights
  getInsights: async () => {
    try {
      const response = await axios.get(`${AI_BASE_URL}/api/ai/insights`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      throw error;
    }
  },

  // Send swarm update
  sendSwarmUpdate: async (vehicleId, update) => {
    try {
      const response = await axios.post(`${AI_BASE_URL}/api/ai/swarm-update`, {
        vehicleId,
        update
      }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error sending swarm update:', error);
      throw error;
    }
  }
};