import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const RequestManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    urgency: '',
    bloodType: '',
    searchQuery: '',
    searchField: 'requestId' // default to requestId search
  });
  
  // For request updates
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // For request details modal
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);

  useEffect(() => {
    // Verify staff permissions
    if (!currentUser?.role?.staff || !currentUser?.staff_approval) {
      navigate('/dashboard');
      return;
    }
    
    fetchRequests();
  }, [currentUser]);
  
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
      
      
      let params = {};
      
      // Add standard filters
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.urgency) params.urgency = filters.urgency;
      if (filters.bloodType) params.bloodType = filters.bloodType;
      
      // Add search by ID or email functionality
      if (filters.searchQuery && filters.searchField) {
        params[filters.searchField] = filters.searchQuery.trim(); 
      }
       
      
      // Use the requests from the staffRoutes endpoint instead of direct requests endpoint
      const response = await axios.get(`${API_URL}/staff/requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: params
      });
       
      
      if (response.data.status === 'success') {
        setRequests(response.data.data || []);
   
      } else {
        setError('Failed to fetch requests. Please try again.');
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      
      // Provide more specific error messages for search-related issues
      if (filters.searchQuery) {
        setError(`Failed to search by ${filters.searchField}: ${err.message}`);
      } else {
        setError(`Failed to fetch request data: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !updateStatus) return;
    
    setSubmitting(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
      
      let payload = {
        status: updateStatus
      };
      
      if (updateStatus === 'rejected') {
        payload.rejectionReason = updateReason;
      }
      
      // Use the staff API endpoint
      const response = await axios.patch(`${API_URL}/staff/requests/${selectedRequest._id}/status`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        // Refresh data
        fetchRequests();
        closeModal();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update request status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const openUpdateModal = (request) => {
    setSelectedRequest(request);
    setUpdateStatus(request.status || '');
    setUpdateReason('');
    setUpdateModal(true);
  };
  
  const closeModal = () => {
    setSelectedRequest(null);
    setUpdateStatus('');
    setUpdateReason('');
    setUpdateModal(false);
  };

  const openDetailsModal = (request) => {
    setSelectedRequestDetails(request);
    setDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedRequestDetails(null);
    setDetailsModal(false);
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      type: '',
      status: '',
      urgency: '',
      bloodType: '',
      searchQuery: '',
      searchField: 'requestId'
    });
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-700">Loading request data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
            <p className="text-gray-600">Monitor and manage all donation requests</p>
          </div>
          
          <div>
            <Link to="/staff/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          {/* Search Section */}
          <div className="mb-4 border-b pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label htmlFor="searchField" className="block text-sm font-medium text-gray-700">Search By</label>
                <select
                  id="searchField"
                  name="searchField"
                  value={filters.searchField}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="requestId">Request ID</option>
                  <option value="userId">User ID</option>
                  <option value="userEmail">User Email</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">Search Query</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="searchQuery"
                    id="searchQuery"
                    value={filters.searchQuery}
                    onChange={handleFilterChange}
                    placeholder={filters.searchField === 'requestId' ? 'Enter Request ID (e.g., REQ-12345)' : 
                                filters.searchField === 'userEmail' ? 'Enter user email address' : 'Enter User ID (e.g., LD-12345)'}
                    className="focus:ring-primary focus:border-primary flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                  />
                  <button
                    onClick={fetchRequests}
                    disabled={loading}
                    className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Standard Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Request Type</label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="blood">Blood</option>
                <option value="organ">Organ</option>
                <option value="tissue">Tissue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="matched">Matched</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">Urgency</label>
              <select
                id="urgency"
                name="urgency"
                value={filters.urgency}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Urgency</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">Blood Type</label>
              <select
                id="bloodType"
                name="bloodType"
                value={filters.bloodType}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Blood Types</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={resetFilters}
                disabled={loading}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-70"
              >
                Reset Filters
              </button>
              <button
                onClick={fetchRequests}
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Applying...
                  </span>
                ) : (
                  'Apply Filters'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={fetchRequests}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Request Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="mt-2 text-gray-500">
                No requests found matching your criteria.
                {filters.searchQuery && (
                  <span className="block mt-1">
                    <strong>Searched for:</strong> {filters.searchField === 'requestId' ? 'Request ID' : 
                                     filters.searchField === 'userId' ? 'User ID' : 'Email'} - "{filters.searchQuery}"
                  </span>
                )}
              </p>
              <button 
                onClick={resetFilters}
                disabled={loading}
                className="mt-3 text-sm font-medium text-primary hover:underline disabled:opacity-70"
              >
                Clear all filters and try again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.requestId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.userObjectId?.fullName || request.userObjectId?.name || request.userId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.userObjectId?.email || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request?.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.type === 'blood' ? 'Blood Request' : 
                         request.type === 'organ' ? 'Organ Request' : 
                         request.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.bloodType || request.organ || request.subType || 'N/A'}
                        {request.quantity > 1 && ` (${request.quantity} units)`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 
                          request.urgency === 'high' ? 'bg-orange-100 text-orange-800' : 
                          request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          request.status === 'matched' || request.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' : 
                          request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => openDetailsModal(request)}
                          className="text-green-600 hover:text-green-800 hover:underline"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => openUpdateModal(request)}
                          className="ml-3 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Update Status
                        </button>
                        <Link
                          to={`/staff/users/${request.userId}`}
                          className="ml-3 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Requester
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Status update modal */}
      {updateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Request Status
              </h3>
              
              <form onSubmit={handleStatusUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request ID</label>
                  <p className="text-sm text-gray-600">{selectedRequest?.requestId}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="matched">Matched</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {updateStatus === 'rejected' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                    <textarea
                      value={updateReason}
                      onChange={(e) => setUpdateReason(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Request Details Modal */}
      {detailsModal && selectedRequestDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white scale-[0.90] rounded-lg max-w-4xl w-full max-h-screen overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Request Details - {selectedRequestDetails.requestId}
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {/* User Details Section */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">User Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.userObjectId?.fullName || selectedRequestDetails.userObjectId?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.userId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.userObjectId?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.userObjectId?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.userObjectId?.dateOfBirth ? 
                        new Date(selectedRequestDetails.userObjectId.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.userObjectId?.bloodType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.userObjectId?.gender ? 
                        selectedRequestDetails.userObjectId.gender.charAt(0).toUpperCase() + 
                        selectedRequestDetails.userObjectId.gender.slice(1) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Status</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                        selectedRequestDetails.userObjectId?.status === 'active' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedRequestDetails.userObjectId?.status ? 
                          selectedRequestDetails.userObjectId.status.charAt(0).toUpperCase() + 
                          selectedRequestDetails.userObjectId.status.slice(1) : 'Unknown'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional User Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Additional User Information</h4>
                
                {/* Address Information */}
                {selectedRequestDetails.userObjectId?.address && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-700 mb-3">Address</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Street</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.address.street || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.address.city || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.address.state || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.address.postalCode || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.address.country || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* KYC and Verification Status */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-700 mb-3">Verification Status</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">KYC Status</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          selectedRequestDetails.userObjectId?.kycStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                          selectedRequestDetails.userObjectId?.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          selectedRequestDetails.userObjectId?.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedRequestDetails.userObjectId?.kycStatus ? 
                            selectedRequestDetails.userObjectId.kycStatus.replace('_', ' ').toUpperCase() : 'NOT SUBMITTED'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Completed</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          selectedRequestDetails.userObjectId?.profile_completed ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedRequestDetails.userObjectId?.profile_completed ? 'YES' : 'NO'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Completion %</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.userObjectId?.profileCompletion || 0}%
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Verified</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          selectedRequestDetails.userObjectId?.isVerified ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedRequestDetails.userObjectId?.isVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Staff Approval</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          selectedRequestDetails.userObjectId?.staff_approval ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedRequestDetails.userObjectId?.staff_approval ? 'APPROVED' : 'NOT APPROVED'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Roles */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-700 mb-3">User Roles</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Donor</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          selectedRequestDetails.userObjectId?.role?.donor ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedRequestDetails.userObjectId?.role?.donor ? 'YES' : 'NO'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Staff</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          selectedRequestDetails.userObjectId?.role?.staff ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedRequestDetails.userObjectId?.role?.staff ? 'YES' : 'NO'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin</label>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          selectedRequestDetails.userObjectId?.role?.admin ? 'bg-purple-100 text-purple-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedRequestDetails.userObjectId?.role?.admin ? 'YES' : 'NO'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedRequestDetails.userObjectId?.emergencyContact && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-700 mb-3">Emergency Contact</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.emergencyContact.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Relationship</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.emergencyContact.relationship || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.emergencyContact.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical Information */}
                {selectedRequestDetails.userObjectId?.medicalInfo && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-700 mb-3">Medical Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.medicalInfo.height || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.medicalInfo.weight || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Checkup</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.medicalInfo.lastCheckup ? 
                            new Date(selectedRequestDetails.userObjectId.medicalInfo.lastCheckup).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Donation</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.lastDonation ? 
                            new Date(selectedRequestDetails.userObjectId.lastDonation).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Next Eligible Donation</label>
                        <p className="text-sm bg-gray-50 p-2 rounded">
                          {selectedRequestDetails.userObjectId.nextEligibleDonation ? (
                            (() => {
                              const nextDate = new Date(selectedRequestDetails.userObjectId.nextEligibleDonation);
                              const today = new Date();
                              const isEligible = today >= nextDate;
                              return (
                                <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                  isEligible ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {isEligible ? 'ELIGIBLE NOW' : nextDate.toLocaleDateString()}
                                </span>
                              );
                            })()
                          ) : (
                            <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              ELIGIBLE NOW
                            </span>
                          )}
                        </p>
                      </div>
                      {selectedRequestDetails.userObjectId.medicalInfo.allergies && 
                       selectedRequestDetails.userObjectId.medicalInfo.allergies.length > 0 && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Allergies</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedRequestDetails.userObjectId.medicalInfo.allergies.join(', ')}
                          </p>
                        </div>
                      )}
                      {selectedRequestDetails.userObjectId.medicalInfo.medications && 
                       selectedRequestDetails.userObjectId.medicalInfo.medications.length > 0 && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedRequestDetails.userObjectId.medicalInfo.medications.join(', ')}
                          </p>
                        </div>
                      )}
                      {selectedRequestDetails.userObjectId.medicalInfo.conditions && 
                       selectedRequestDetails.userObjectId.medicalInfo.conditions.length > 0 && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {selectedRequestDetails.userObjectId.medicalInfo.conditions.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Donation History Summary */}
                {selectedRequestDetails.userObjectId?.donationHistory && 
                 selectedRequestDetails.userObjectId.donationHistory.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-700 mb-3">Donation History Summary</h5>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-900">
                        <strong>Total Donations:</strong> {selectedRequestDetails.userObjectId.donationHistory.length}
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        <strong>Recent Donations:</strong>
                      </p>
                      <div className="mt-2 space-y-1">
                        {selectedRequestDetails.userObjectId.donationHistory.slice(0, 3).map((donation, index) => (
                          <div key={index} className="text-xs text-gray-700 bg-white p-2 rounded">
                            {donation.type} - {donation.status} - {new Date(donation.date).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Timestamps */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-700 mb-3">Account Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Created</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.userObjectId?.createdAt ? 
                          new Date(selectedRequestDetails.userObjectId.createdAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.userObjectId?.lastLogin ? 
                          new Date(selectedRequestDetails.userObjectId.lastLogin).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Details Section */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Request Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Request ID</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.requestId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Request Type</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.type === 'blood' ? 'Blood Request' : 
                       selectedRequestDetails.type === 'organ' ? 'Organ Request' : 
                       selectedRequestDetails.type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sub Type</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.subType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                        selectedRequestDetails.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        selectedRequestDetails.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        selectedRequestDetails.status === 'matched' || selectedRequestDetails.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' : 
                        selectedRequestDetails.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedRequestDetails.status.charAt(0).toUpperCase() + selectedRequestDetails.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                        selectedRequestDetails.urgency === 'critical' ? 'bg-red-100 text-red-800' : 
                        selectedRequestDetails.urgency === 'high' ? 'bg-orange-100 text-orange-800' : 
                        selectedRequestDetails.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedRequestDetails.urgency.charAt(0).toUpperCase() + selectedRequestDetails.urgency.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Is For Self</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {selectedRequestDetails.isForSelf ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Details (if not for self) */}
              {!selectedRequestDetails.isForSelf && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Patient Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.patientName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recipient Age</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.recipientAge || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Details */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Medical Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequestDetails.bloodType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Required Blood Type</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.bloodType}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.organ && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Required Organ</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.organ}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.organType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organ Type</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.organType}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.quantity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity (Units)</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.quantity}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.requiredBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Required By</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {new Date(selectedRequestDetails.requiredBy).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.medicalCondition && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medical Condition</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.medicalCondition}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.doctorName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Doctor Name</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.doctorName}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.doctorContact && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Doctor Contact</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.doctorContact}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.medicalCertificate && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Medical Certificate</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.medicalCertificate}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.medicalNotes && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Medical Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                        {selectedRequestDetails.medicalNotes}
                      </p>
                    </div>
                  )}
                  {selectedRequestDetails.medicalDetails && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Medical Details</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                        {selectedRequestDetails.medicalDetails}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hospital Details */}
              {selectedRequestDetails.hospital && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Hospital Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.hospital.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hospital Phone</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.hospital.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Hospital Address</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.hospital.address || 'N/A'}
                      </p>
                    </div>
                    {selectedRequestDetails.hospital.coordinates && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          Lat: {selectedRequestDetails.hospital.coordinates.latitude}, 
                          Lng: {selectedRequestDetails.hospital.coordinates.longitude}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Campaign Details */}
              {selectedRequestDetails.campaignRequired && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Campaign Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Campaign Required</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedRequestDetails.campaignRequired ? 'Yes' : 'No'}
                      </p>
                    </div>
                    {selectedRequestDetails.campaignDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Campaign Date</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {new Date(selectedRequestDetails.campaignDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedRequestDetails.campaignDescription && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Campaign Description</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                          {selectedRequestDetails.campaignDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Details */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Status Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequestDetails.rejectionReason ? (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                      <p className="text-sm text-gray-900 bg-red-50 border border-red-200 p-2 rounded whitespace-pre-wrap">
                        {selectedRequestDetails.rejectionReason}
                      </p>
                    </div>
                  ) : ('None')}
                  {selectedRequestDetails.statusNotes && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Status Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                        {selectedRequestDetails.statusNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fulfillment Details */}
              {selectedRequestDetails.fulfilledBy && selectedRequestDetails.fulfilledBy.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Fulfillment Details</h4>
                  <div className="space-y-4">
                    {selectedRequestDetails.fulfilledBy.map((fulfillment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Donor ID</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {fulfillment.donorId || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Donation ID</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {fulfillment.donationId || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {fulfillment.quantity || 'N/A'}
                            </p>
                          </div>
                          <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Fulfillment Date</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                              {fulfillment.date ? new Date(fulfillment.date).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Timestamps</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {new Date(selectedRequestDetails.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Updated At</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {new Date(selectedRequestDetails.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-6 bg-gray-50 flex justify-end">
              {/* <button
                onClick={closeDetailsModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
              >
                Close
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
