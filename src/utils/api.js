// src/utils/api.js
import axios from "axios";

// Enforce HTTPS for production, allow HTTP for local development
const getBaseURL = () => {
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    return "https://chat-app-backend-31vq.onrender.com";
  }
  
  // For production, ensure HTTPS
  const baseURL = "https://chat-app-backend-31vq.onrender.com";
  return baseURL.startsWith('http:') ? baseURL.replace('http:', 'https:') : baseURL;
};

export const API_BASE_URL = getBaseURL();

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for cold starts
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for authentication
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
