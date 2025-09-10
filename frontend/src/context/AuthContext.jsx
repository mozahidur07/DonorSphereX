import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import useUserStore from '../store/userStore';

// Create the context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState(null);
  
  // Access user store methods
  const { fetchUserData, clearUserData } = useUserStore();
  
  // API URL from environment variable or default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  // Initialize axios with auth token if available
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);
  
  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        setAuthChecked(true);
        return;
      }
      
      try {
        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data using the centralized store
        const userData = await fetchUserData();
        
        if (userData) {
          // Set current user in auth context
          setCurrentUser({
            userId: userData.userId,
            name: userData.name || userData.fullName,
            fullName: userData.fullName || userData.name,
            email: userData.email,
            role: userData.role,
            staff_approval: userData.staff_approval,
          });
        } else {
          // If fetchUserData returns null, clear the token
          localStorage.removeItem('authToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('authToken'); // Clear invalid token
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [API_URL, fetchUserData]);
  
  // Login function
  const login = async (email, password, selectedRole = 'donor') => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      console.log('Login response:', response.data);
      
      // Get token and user data from the response structure
      const token = response.data.data.token;
      const userData = {
        userId: response.data.data.userId,
        name: response.data.data.name || response.data.data.fullName,
        fullName: response.data.data.fullName || response.data.data.name,
        email: response.data.data.email,
        role: response.data.data.role
      };
      
      // Check if the selected role matches the user's actual role
      let roleMatched = true;
      let userRole = 'donor';
      
      // Determine the user's primary role
      if (userData.role) {
        if (typeof userData.role === 'object') {
          // If role is an object with boolean values (e.g. { donor: true, staff: false })
          const userRoles = Object.entries(userData.role)
            .filter(([_, hasRole]) => hasRole)
            .map(([roleName]) => roleName);
          
          userRole = userRoles.length > 0 ? userRoles[0] : 'donor';
          roleMatched = userData.role[selectedRole] === true;
        } else if (Array.isArray(userData.role)) {
          // If role is an array of strings
          userRole = userData.role.length > 0 ? userData.role[0] : 'donor';
          roleMatched = userData.role.includes(selectedRole);
        }
      }
      
      console.log(`Role check: selected=${selectedRole}, actual=${userRole}, matched=${roleMatched}`);
      
      if (!roleMatched) {
        return { 
          success: true, 
          roleMatched: false,
          userRole: userRole
        };
      }
      
      // Store token and set axios default header
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set current user in auth context
      setCurrentUser(userData);
      
      // Fetch full user data to populate the store
      await fetchUserData();
      
      return { 
        success: true, 
        roleMatched: true,
        isNewIP: response.data.data.isNewIP,
        user: userData
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Logout from current device
  const logout = async (allDevices = false) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        if (allDevices) {
          await axios.post(`${API_URL}/auth/logout-all`);
        } else {
          await axios.post(`${API_URL}/auth/logout`);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear auth context
      setCurrentUser(null);
      
      // Clear user store data
      clearUserData();
    }
  };
  
  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      console.log('Sending registration data:', userData);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      console.log('Register response:', response.data);
      
      // Get token and user data from the response structure
      const token = response.data.data.token;
      const registeredUser = {
        userId: response.data.data.userId,
        name: response.data.data.name || response.data.data.fullName,
        fullName: response.data.data.fullName || response.data.data.name,
        email: response.data.data.email,
        role: response.data.data.role
      };
      
      console.log('Extracted user data:', registeredUser);
      console.log('Token:', token);
      
      // Store token and set axios default header
      localStorage.setItem('authToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set current user in auth context
      setCurrentUser(registeredUser);
      
      // Fetch full user data to populate the store
      await fetchUserData();
      
      return { success: true, user: registeredUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Update profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      // Use the updateUserData function from the store
      const result = await useUserStore.getState().updateUserData(profileData);
      
      if (result.success) {
        // Update basic user info in auth context if name changed
        if (profileData.name || profileData.fullName) {
          setCurrentUser({
            ...currentUser,
            name: profileData.name || profileData.fullName || currentUser.name,
            fullName: profileData.fullName || profileData.name || currentUser.fullName
          });
        }
        return result;
      } else {
        throw new Error(result.error || 'Profile update failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Change password
  const changePassword = async (currentPassword, newPassword, logoutAllDevices = false) => {
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/profile/change-password`, {
        currentPassword,
        newPassword,
        logoutAllDevices
      });
      
      // If logoutAllDevices is true, we need to logout the current user after password change
      if (logoutAllDevices) {
        // Clear token from localStorage
        localStorage.removeItem('authToken');
        
        // Remove auth header
        delete axios.defaults.headers.common['Authorization'];
        
        // Clear auth context
        setCurrentUser(null);
        
        // Clear user store data
        clearUserData();
      } else {
        // Check if there's remembered login info in localStorage
        const rememberedLogin = localStorage.getItem('rememberedLogin');
        if (rememberedLogin) {
          try {
            // Parse the remembered login data
            const loginData = JSON.parse(rememberedLogin);
            
            // Update the password in the remembered login
            if (loginData && loginData.email) {
              loginData.password = newPassword;
              localStorage.setItem('rememberedLogin', JSON.stringify(loginData));
            }
          } catch (e) {
            console.error('Error updating remembered login:', e);
            // Remove invalid remembered login
            localStorage.removeItem('rememberedLogin');
          }
        }
      }
      
      return { 
        success: true,
        logoutAllDevices: response.data.data.logoutAllDevices
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  // Get auth token
  const getToken = () => {
    return localStorage.getItem('authToken');
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!currentUser && !!token;
  };
   
  const hasRole = (role) => { 
    if (!currentUser || !currentUser.role) return false;
    
    if (Array.isArray(currentUser.role)) {
      return currentUser.role.includes(role);
    } else if (typeof currentUser.role === 'object') {
      return !!currentUser.role[role];
    }
    
    return false;
  };

  const value = {
    currentUser,
    loading,
    authChecked,
    error,
    login,
    logout,
    register,
    getToken,
    isAuthenticated,
    hasRole,
    updateProfile,
    changePassword,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
