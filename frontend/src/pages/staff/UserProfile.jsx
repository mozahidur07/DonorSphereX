import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  
  // For KYC update
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycStatus, setKycStatus] = useState('');
  const [kycRejectionReason, setKycRejectionReason] = useState('');
  const [updatingKyc, setUpdatingKyc] = useState(false);
  
  useEffect(() => {
    // Verify staff permissions
    if (!currentUser?.role?.staff || !currentUser?.staff_approval) {
      navigate('/dashboard');
      return;
    }
    
    fetchUserData();
  }, [userId, currentUser, navigate]);
  
  const updateKycStatus = async () => {
    if (!kycStatus) {
      toast.error('Please select a status');
      return;
    }
    
    setUpdatingKyc(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
       
      let backendStatus = kycStatus;
      if (kycStatus === 'completed') {
        backendStatus = 'approved'; 
      } 
      const payload = {
        status: backendStatus,
        rejection_reason: kycRejectionReason || ""  
      };
      
 
      
      const response = await axios.patch(`${API_URL}/staff/users/${userId}/kyc`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
       
      
      if (response.data.status === 'success') {
        toast.success('KYC status updated successfully');
        setShowKycModal(false);
         
        setTimeout(() => {
          fetchUserData();  
        }, 1000);
      } else {
        throw new Error('Failed to update KYC status');
      }
    } catch (err) {
      console.error("Error updating KYC status:", err);
       
      if (err.response) { 
        console.error("Server response error data:", err.response.data);
        console.error("Server response error status:", err.response.status);
        
        if (err.response.status === 400) {
          toast.error(`Bad request: ${err.response.data.message || 'Invalid KYC status'}`);
        } else if (err.response.status === 403) {
          toast.error('You do not have permission to update KYC status');
        } else if (err.response.status === 404) {
          toast.error('User not found');
        } else {
          toast.error(err.response.data.message || 'Failed to update KYC status');
        }
      } else if (err.request) { 
        console.error("No response received:", err.request);
        toast.error('Server did not respond. Please check your network connection.');
      } else { 
        toast.error('Failed to update KYC status: ' + err.message);
      }
    } finally {
      setUpdatingKyc(false);
    }
  };
  
  const openKycModal = () => { 
    let initialStatus = '';
     
    if (user.kycStatus) {
      initialStatus = user.kycStatus;
    } else if (user.kyc_status) {
      initialStatus = user.kyc_status;
    }
     
    if (initialStatus === 'approved') {
      initialStatus = 'completed';
    }
     
    
    setKycStatus(initialStatus);
    setKycRejectionReason(user.kyc_rejection_reason || '');
    setShowKycModal(true);
  };
  
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
       
      
      const userResponse = await axios.get(`${API_URL}/staff/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }); 
      
      if (userResponse.data.status === 'success') { 
        const userData = userResponse.data.data; 
        
        setUser(userData);
        
        // Fetch user's donations
        const donationsResponse = await axios.get(`${API_URL}/donations/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (donationsResponse.data.status === 'success') {
          setDonations(donationsResponse.data.data || []);
        }
        
        // Fetch user's requests
        const requestsResponse = await axios.get(`${API_URL}/requests/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (requestsResponse.data.status === 'success') {
          setRequests(requestsResponse.data.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-700">Loading user data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 w-full max-w-2xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchUserData}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 w-full max-w-2xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 00-1 1v2a1 1 0 002 0v-2a1 1 0 00-1-1zm0-7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">User not found.</p>
              <Link 
                to="/staff/users" 
                className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600 underline"
              >
                Back to User List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link to="/staff/users" className="flex items-center text-gray-600 hover:text-primary transition">
            <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to User List
          </Link>
        </div>
        
        {/* Header section with user profile */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user.profilePicture?.url ? (
                  <img 
                    src={user.profilePicture.url} 
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name || 'User'} 
                  {user.fullName && user.fullName !== user.name && ` ${user.fullName}`}
                </h1>
                <p className="text-gray-600">
                  ID: {user.userId}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  
                  {user.isVerified && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Verified
                    </span>
                  )}
                  
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    {user.role?.admin ? 'Admin' : user.role?.staff ? 'Staff' : 'Donor'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => window.open(`mailto:${user.email}`, '_blank')}
              >
                Contact User
              </button>
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="mb-6 bg-white rounded-lg shadow-sm overflow-x-auto">
          <div className="p-1 flex">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-md ${activeTab === 'profile' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('donations')}
              className={`px-4 py-2 rounded-md ${activeTab === 'donations' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Donations ({donations.length})
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-md ${activeTab === 'requests' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Requests ({requests.length})
            </button>
          </div>
        </div>
        
        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="mt-1 font-medium">{user.name || 'Not provided'} {user.fullName && user.fullName !== user.name && ` (${user.fullName})`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="mt-1 font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="mt-1 font-medium">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="mt-1 font-medium">{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="mt-1 font-medium">{user.bloodType || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="mt-1 font-medium">{user.gender ? user.gender.replace(/_/g, ' ') : 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="mt-1 font-medium">
                    {user.address ? 
                      `${user.address.street || ''} ${user.address.city || ''} ${user.address.state || ''} ${user.address.postalCode || ''} ${user.address.country || ''}` : 
                      'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registered On</p>
                  <p className="mt-1 font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 pt-4">Health Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="mt-1 font-medium">{user.medicalInfo?.height ? `${user.medicalInfo.height} cm` : 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="mt-1 font-medium">{user.medicalInfo?.weight ? `${user.medicalInfo.weight} kg` : 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Medical Conditions</p>
                  <p className="mt-1 font-medium">{user.medicalInfo?.conditions?.join(', ') || 'None reported'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Allergies</p>
                  <p className="mt-1 font-medium">{user.medicalInfo?.allergies?.join(', ') || 'None reported'}</p>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 pt-4">Account Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-blue-700">{donations.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Completed Donations</p>
                  <p className="text-2xl font-bold text-green-700">
                    {donations.filter(donation => donation.status === 'completed').length}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-purple-700">{requests.length}</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 pt-4">KYC Status</h2>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">KYC Status: 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        user.kycStatus === 'completed' || user.kycStatus === 'approved' || 
                        user.kyc_status === 'completed' || user.kyc_status === 'approved' ? 'bg-green-100 text-green-800' : 
                        user.kycStatus === 'rejected' || user.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        user.kycStatus === 'pending' || user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        user.kycStatus === 'not_submitted' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.kycStatus === 'approved' || user.kyc_status === 'approved' ? 'Completed' : 
                         user.kycStatus === 'not_submitted' ? 'Not Submitted' :
                         (user.kycStatus || user.kyc_status)?.replace(/_/g, ' ') || 'Not Submitted'}
                      </span>
                    </p>
                    {(user.kycStatus === 'rejected' || user.kyc_status === 'rejected') && user.kyc_rejection_reason && (
                      <p className="text-sm text-red-600 mt-1">
                        <span className="font-medium">Rejection Reason:</span> {user.kyc_rejection_reason}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {(user.kycDocument?.url || user.kycDocuments?.aadharCard?.url) && (
                      <a 
                        href={user.kycDocument?.url || user.kycDocuments?.aadharCard?.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        View Document
                      </a>
                    )}
                    <button 
                      onClick={openKycModal}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Update KYC Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'donations' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Donation History</h2>
              
              {donations.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="mt-2">No donations found for this user.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {donations.map((donation) => (
                        <tr key={donation._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {donation.donationId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(donation.date || donation.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {donation.donationType || donation.type || 'Blood'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {donation.bloodType || donation.organ || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {donation.location || donation.preferredHospital || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              donation.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              donation.status === 'rejected' || donation.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {donation.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Request History</h2>
              
              {requests.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p className="mt-2">No requests found for this user.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr key={request._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.requestId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(request.date || request.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.requestType || request.type || 'Blood Request'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.bloodGroup || request.bloodType || request.organ || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 
                              request.urgency === 'high' ? 'bg-orange-100 text-orange-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.urgency || 'Normal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              request.status === 'rejected' || request.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request?.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* KYC Update Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update KYC Status
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); updateKycStatus(); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={kycStatus}
                    onChange={(e) => setKycStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed/Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="not_submitted">Not Submitted</option>
                  </select>
                </div>
                
                {kycStatus === 'rejected' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (Optional)</label>
                    <textarea
                      value={kycRejectionReason}
                      onChange={(e) => setKycRejectionReason(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      rows="3"
                    ></textarea>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowKycModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    disabled={updatingKyc}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
                    disabled={updatingKyc}
                  >
                    {updatingKyc ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
