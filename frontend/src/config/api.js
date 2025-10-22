import axios from 'axios';

// Get API URL from environment variable
// In production: https://finvix-backend.onrender.com
// In development: http://localhost:5000
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('🚀 API configured with base URL:', API_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: false, // Important for CORS
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Log errors with more detail
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Clearing session and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // Prevent redirect loop
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Access forbidden');
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('⚠️ Server error. Please try again later.');
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('🌐 Network error. Please check your connection and ensure backend is running.');
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout. Server took too long to respond.');
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;

// Export API_URL for direct use if needed
export { API_URL };
