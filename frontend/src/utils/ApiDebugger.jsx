import React, { useEffect, useState } from 'react';
import api from './api';

/**
 * A debug component to monitor API calls and display them in the console
 */
const ApiDebugger = () => {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Set up API request interceptor
    const requestInterceptor = api.interceptors.request.use((config) => {
      const requestData = {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}/${config.url}`.replace(/\/+/g, '/').replace(':/', '://'),
        headers: config.headers,
        params: config.params,
        data: config.data,
        timestamp: new Date().toISOString()
      };

      console.log('%c API Request ', 'background: #2196F3; color: #fff', requestData);
      
      setLogs(prevLogs => [...prevLogs, { type: 'request', ...requestData }]);
      return config;
    });

    // Set up API response interceptor
    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        const responseData = {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          method: response.config.method?.toUpperCase(),
          data: response.data,
          timestamp: new Date().toISOString()
        };

        console.log('%c API Response ', 'background: #4CAF50; color: #fff', responseData);
        
        setLogs(prevLogs => [...prevLogs, { type: 'response', ...responseData }]);
        return response;
      },
      (error) => {
        const errorData = {
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          timestamp: new Date().toISOString()
        };

        console.log('%c API Error ', 'background: #F44336; color: #fff', errorData);
        
        setLogs(prevLogs => [...prevLogs, { type: 'error', ...errorData }]);
        return Promise.reject(error);
      }
    );

    // Clean up interceptors when component unmounts
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Toggle visibility of debug panel
  const toggleDebugger = () => {
    setIsActive(!isActive);
  };

  // Only render the button in development
  if (import.meta.env.DEV) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleDebugger}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-all"
          title="API Debugger"
        >
          🐛
        </button>
      </div>
    );
  }

  return null;
};

export default ApiDebugger;
