import { useCallback, useState } from 'react';
import api, { apiGet, apiPost, apiPut, apiDelete } from './api';

// Custom hook for API requests with loading and error states
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic request handler
  const request = useCallback(async (method, url, data = null, config = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await apiGet(url, config);
          break;
        case 'post':
          response = await apiPost(url, data, config);
          break;
        case 'put':
          response = await apiPut(url, data, config);
          break;
        case 'delete':
          response = await apiDelete(url, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return response.data;
    } catch (err) {
      console.error(`API Error (${method.toUpperCase()} ${url}):`, err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(errorMessage);
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Convenience methods for different request types
  const get = useCallback((url, config) => request('get', url, null, config), [request]);
  const post = useCallback((url, data, config) => request('post', url, data, config), [request]);
  const put = useCallback((url, data, config) => request('put', url, data, config), [request]);
  const del = useCallback((url, config) => request('delete', url, config), [request]);
  
  // Clear any errors
  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    clearError,
    get,
    post,
    put,
    delete: del,
    request,
    // Also export the raw API instance for advanced usage
    api
  };
};

export default useApi;
