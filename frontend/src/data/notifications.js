import axios from 'axios';
 
export const fetchNotifications = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('authToken');

    if (!token) { 
      return { data: [], unreadCount: 0 };
    }

    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.status === 'success') {
      return {
        data: response.data.data || [],
        unreadCount: response.data.unreadCount || 0
      };
    } else {
      console.error('Error fetching notifications:', response.data.message);
      return { data: [], unreadCount: 0 };
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: [], unreadCount: 0 };
  }
};
 
export const addAccountCreationNotification = async (userId) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
      return false;
    }

    const notification = {
      message: "Account created successfully! Welcome to our platform.",
      type: "success",
      from: "System"
    };

    const response = await axios.post(
      `${API_URL}/notifications/add`,
      { notification },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.status === 'success';
  } catch (error) {
    console.error('Error adding account creation notification:', error);
    return false;
  }
};
 
export const markNotificationAsRead = async (notificationId) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
      return false;
    }

    const response = await axios.patch(
      `${API_URL}/notifications/${notificationId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.status === 'success';
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};
 
export const markAllNotificationsAsRead = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
      return false;
    }

    const response = await axios.patch(
      `${API_URL}/notifications/mark-all-read`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.status === 'success';
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};
 
export const addBloodTypeUpdateNotification = async (bloodType) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
      return false;
    }

    const notification = {
      message: `Your blood type has been updated to ${bloodType}`,
      type: "success",
      from: "System"
    };

    const response = await axios.post(
      `${API_URL}/notifications/add`,
      { notification },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.status === 'success';
  } catch (error) {
    console.error('Error adding blood type update notification:', error);
    return false;
  }
};
 
export const addProfileUpdateNotification = async (updateType) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('authToken');

    if (!token) { 
      return false;
    }

    let message = "Your profile has been updated successfully";
    
    if (updateType === 'basic') {
      message = "Your basic profile details have been updated successfully";
    } else if (updateType === 'contact') {
      message = "Your contact information has been updated successfully";
    } else if (updateType === 'medical') {
      message = "Your medical information has been updated successfully";
    }

    const notification = {
      message,
      type: "success",
      from: "System"
    };

    const response = await axios.post(
      `${API_URL}/notifications/add`,
      { notification },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.status === 'success';
  } catch (error) {
    console.error('Error adding profile update notification:', error);
    return false;
  }
};
 
export const notifications = [];
