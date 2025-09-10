import React, { useEffect } from 'react';
import { useUserData } from '../data/userData';

 
const UserDataLoader = ({ children }) => {
  const { fetchUserData } = useUserData();
   
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      fetchUserData();
    }
  }, [fetchUserData]);
  
  return <>{children}</>;
};

export default UserDataLoader;
