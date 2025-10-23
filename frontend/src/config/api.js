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
    
    // ✅ UPDATED: Log requests in both development AND production (for debugging)
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      timestamp: new Date().toISOString(), // ✅ ADDED: Timestamp for tracking
    });
    
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
    // ✅ UPDATED: Log successful responses in both dev and production
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      dataSize: JSON.stringify(response.data).length, // ✅ ADDED: Data size for monitoring
      timestamp: new Date().toISOString(), // ✅ ADDED: Timestamp
    });
    
    // ✅ ADDED: Log response data only in development (avoid cluttering production logs)
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 Response Data:', response.data);
    }
    
    return response;
  },
  (error) => {
    // ✅ ENHANCED: More detailed error logging
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText, // ✅ ADDED
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(), // ✅ ADDED
      data: error.response?.data,
      timestamp: new Date().toISOString(), // ✅ ADDED
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Clearing session and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // Prevent redirect loop
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Access forbidden - User does not have permission');
    }
    
    // ✅ ADDED: Handle 400 Bad Request (validation errors)
    if (error.response?.status === 400) {
      console.error('⚠️ Bad Request:', error.response?.data?.error || 'Invalid data sent to server');
    }
    
    // ✅ ADDED: Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 Not Found - API endpoint does not exist:', error.config?.url);
    }
    
    // ✅ ADDED: Handle 429 Too Many Requests (rate limiting)
    if (error.response?.status === 429) {
      console.error('🚦 Rate limit exceeded - Too many requests. Please wait and try again.');
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('⚠️ Server error. The backend encountered an issue. Please try again later.');
    }
    
    // ✅ ADDED: Handle 502/503/504 Gateway errors (Render restarts, etc.)
    if ([502, 503, 504].includes(error.response?.status)) {
      console.error('🔧 Service temporarily unavailable. Backend may be restarting. Please retry in 30 seconds.');
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('🌐 Network error. Possible causes:');
      console.error('   1. Backend is down or unreachable');
      console.error('   2. CORS configuration issue');
      console.error('   3. Internet connection lost');
      console.error(`   4. Check if ${API_URL} is accessible`);
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout. Server took longer than 30 seconds to respond.');
      console.error('   This may indicate:');
      console.error('   - Heavy server load');
      console.error('   - Large file processing');
      console.error('   - Backend performance issue');
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;

// Export API_URL for direct use if needed
export { API_URL };
