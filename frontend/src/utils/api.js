import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
 
api.interceptors.response.use(
  (response) => {
    
    // Check if we got a proper response structure with status field
    if (response.data && typeof response.data === 'object') {
      if (response.data.status === 'error') {
        // If the API returns status: 'error', convert it to an axios error
        return Promise.reject({ 
          response: {
            status: 400, 
            data: response.data
          }
        });
      }
    }
    
    return response;
  },
  (error) => {
    // Handle specific error responses
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.status, error.response.data);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        // Check if it's a token validation error
        if (error.response.data.message === 'Invalid token' || 
            error.response.data.message === 'Token expired' || 
            error.response.data.message === 'Authentication required') {
          // Clear auth token
          localStorage.removeItem('authToken');
          // Redirect to login if needed
          window.location.href = '/signin';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export instance methods for easier access
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);
export const apiPatch = (url, data = {}, config = {}) => api.patch(url, data, config);

// Export the full instance for more complex use cases
export default api;
