import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resq_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('resq_token', response.data.token);
    localStorage.setItem('resq_user', JSON.stringify(response.data));
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('resq_token', response.data.token);
    localStorage.setItem('resq_user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('resq_token');
  localStorage.removeItem('resq_user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('resq_user') || localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Food API
export const getFoodListings = async () => {
  const response = await api.get('/food');
  return response.data;
};

export const createFoodListing = async (foodData) => {
  const response = await api.post('/food', foodData);
  // After successful listing creation, trigger priority algorithm
  if (response.data && response.data._id) {
    console.log('New listing created with ID:', response.data._id);
    await processNewListingForPriority(response.data._id);
  }
  return response.data;
};

export const processNewListingForPriority = async (listingId) => {
  const response = await api.post(`/priority/process-listing/${listingId}`);
  return response.data;
};

export const updateFoodStatus = async (id, status) => {
  const response = await api.put(`/food/${id}`, { status });
  return response.data;
};

export const getLocationPreview = async (locationData) => {
  const response = await api.post('/food/location-preview', locationData);
  return response.data;
};

// Chat API
export const sendChatMessage = async (question) => {
  try {
    console.log('Sending chat message to API:', question);
    const response = await api.post('/chat', { question });
    console.log('Received response from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Chat API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      request: error.request ? 'Request made but no response' : 'Request setup failed'
    });
    throw error;
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    // Use axios directly to hit the root endpoint, not /api/
    const response = await axios.get('http://localhost:5001/');
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Admin API
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAIInsights = async () => {
  const response = await api.get('/admin/insights');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// Priority API
export const getPrioritizedDonations = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/priority/donations${query ? `?${query}` : ''}`);
  return response.data;
};

export const getOptimizedRoutes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/priority/routes${query ? `?${query}` : ''}`);
  return response.data;
};

export const getDonationPriority = async (id) => {
  const response = await api.get(`/priority/donation/${id}`);
  return response.data;
};

// Fraud Detection API
export const checkFraud = async (donationData) => {
  const response = await api.post('/fraud/check', donationData);
  return response.data;
};

export const predictWaste = async (predictionData) => {
  const response = await api.post('/fraud/waste', predictionData);
  return response.data;
};

// Notification API
export const sendNotificationToAll = async (notificationData) => {
  const response = await api.post('/notifications/all', notificationData);
  return response.data;
};

export const sendNotificationToSegment = async (notificationData) => {
  const response = await api.post('/notifications/segment', notificationData);
  return response.data;
};

export const sendNotificationToUsers = async (notificationData) => {
  const response = await api.post('/notifications/users', notificationData);
  return response.data;
};

export default api;