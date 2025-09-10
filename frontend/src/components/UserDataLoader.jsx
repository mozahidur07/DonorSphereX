import React, { useEffect } from 'react';
import { useUserData } from '../data/userData';

/**
 * A middleware component that ensures user data is loaded once at app startup
 * if the user is authenticated
 */
const UserDataLoader = ({ children }) => {
  const { fetchUserData } = useUserData();
  
  // Fetch user data once on component mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      fetchUserData();
    }
  }, [fetchUserData]);
  
  return <>{children}</>;
};

export default UserDataLoader;
