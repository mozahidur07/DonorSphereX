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
    
    
    if (response.data && typeof response.data === 'object') {
      if (response.data.status === 'error') {
    
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
     
    if (error.response) {
      
      console.error('API Error Response:', error.response.status, error.response.data);
      
      
      if (error.response.status === 401) {
        
        if (error.response.data.message === 'Invalid token' || 
            error.response.data.message === 'Token expired' || 
            error.response.data.message === 'Authentication required') {
          
          localStorage.removeItem('authToken');
           
          window.location.href = '/signin';
        }
      }
    } else if (error.request) { 
      console.error('API Error Request:', error.request);
    } else { 
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
 
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data = {}, config = {}) => api.post(url, data, config);
export const apiPut = (url, data = {}, config = {}) => api.put(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);
export const apiPatch = (url, data = {}, config = {}) => api.patch(url, data, config);
 
export default api;
