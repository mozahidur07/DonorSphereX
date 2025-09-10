
const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchRequests = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await fetch(`${API_URL}/staff/requests?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch requests');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

export const updateRequestStatus = async (requestId, status, rejectionReason = '') => {
  try {
    const payload = {
      status
    };
    
    if (status === 'rejected' && rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }
    
    const response = await fetch(`${API_URL}/staff/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to update request status');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

export const fetchDonations = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await fetch(`${API_URL}/donations?${queryParams.toString()}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch donations');
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching donations:', error);
    throw error;
  }
};

export const updateDonationStatus = async (donationId, status, rejectionReason = '') => {
  try {
    const payload = {
      status
    };
    
    if (status === 'rejected' && rejectionReason) {
      payload.statusNotes = rejectionReason;
    }
    
    const response = await fetch(`${API_URL}/donations/${donationId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to update donation status');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error updating donation status:', error);
    throw error;
  }
};

export const fetchUserById = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch user');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export default {
  fetchRequests,
  updateRequestStatus,
  fetchDonations,
  updateDonationStatus,
  fetchUserById
};
