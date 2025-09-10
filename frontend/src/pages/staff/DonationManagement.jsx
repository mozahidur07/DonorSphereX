import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const DonationManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    donationType: '',
    status: '',
    startDate: '',
    endDate: '',
    searchQuery: '',
    searchField: 'donationId'  // default to donationId search
  });
  
  // For donation updates
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Verify staff permissions
    if (!currentUser?.role?.staff || !currentUser?.staff_approval) {
      navigate('/dashboard');
      return;
    }
    
    fetchDonations();
  }, [currentUser, page, filters]);
  
  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams({
        page,
        limit
      });
      
      if (filters.donationType) queryParams.append('donationType', filters.donationType);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      if (filters.searchQuery && filters.searchField) {
        queryParams.append(filters.searchField, filters.searchQuery);
      }
      
      const response = await axios.get(`${API_URL}/donations/all?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.status === 'success') {
        setDonations(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError('Failed to fetch donations. Please try again.');
      }
    } catch (err) {
      console.error("Error fetching donations:", err);
      setError("Failed to fetch donation data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDonation || !updateStatus) return;
    
    setSubmitting(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
      
      let payload = {
        status: updateStatus
      };
      
      if (updateStatus === 'rejected') {
        payload.statusNotes = updateReason;
      }
      
      
      const response = await axios.put(`${API_URL}/donations/${selectedDonation.donationId}/status`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      
      if (response.data.status === 'success') {
        // Refresh data
        fetchDonations();
        closeModal();
      } else {
        setError(`Update failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      setError(`Failed to update donation status: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const openUpdateModal = (donation) => {
    setSelectedDonation(donation);
    setUpdateStatus(donation.status || '');
    setUpdateReason('');
    setUpdateModal(true);
  };
  
  const closeModal = () => {
    setSelectedDonation(null);
    setUpdateStatus('');
    setUpdateReason('');
    setUpdateModal(false);
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
    setPage(1); // Reset to first page when filters change
  };
  
  const resetFilters = () => {
    setFilters({
      donationType: '',
      status: '',
      startDate: '',
      endDate: '',
      searchQuery: '',
      searchField: 'donationId'
    });
    setPage(1);
  };

  if (loading && donations.length === 0) {
    return (
      <div className="min-h-screen p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-700">Loading donation data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donation Management</h1>
            <p className="text-gray-600">Monitor and manage all donation records</p>
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
                  <option value="donationId">Donation ID</option>
                  <option value="userEmail">User Email</option>
                  <option value="userId">User ID</option>
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
                    placeholder={filters.searchField === 'donationId' ? 'Enter Donation ID...' : 
                                filters.searchField === 'userEmail' ? 'Enter user email...' : 'Enter User ID...'}
                    className="focus:ring-primary focus:border-primary flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                  />
                  <button
                    onClick={fetchDonations}
                    className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Standard Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="donationType" className="block text-sm font-medium text-gray-700">Donation Type</label>
              <select
                id="donationType"
                name="donationType"
                value={filters.donationType}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                <option value="Blood">Blood</option>
                <option value="Organ">Organ</option>
                <option value="Tissue">Tissue</option>
                <option value="Other">Other</option>
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
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              />
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Reset Filters
              </button>
              <button
                onClick={fetchDonations}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
              >
                Apply Filters
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
                  onClick={fetchDonations}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Donation Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {donations.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-2 text-gray-500">No donations found matching your filters.</p>
              <button 
                onClick={resetFilters}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                Clear filters and try again
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {donation.donationId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{donation.userName}</div>
                          <div className="text-sm text-gray-500">{donation.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.donationType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.donationType === 'Blood' ? donation.bloodType :
                           donation.donationType === 'Organ' ? donation.organType : 
                           donation.donationSubType || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(donation.date || donation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.location || donation.preferredHospital || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            donation.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            donation.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            donation.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                            donation.status === 'processing' ? 'bg-purple-100 text-purple-800' : 
                            donation.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => openUpdateModal(donation)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Update Status
                          </button>
                          <Link
                            to={`/staff/users/${donation.userId}`}
                            className="ml-3 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Donor
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      page === 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      page === totalPages ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{donations.length ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium">{Math.min(page * limit, (page - 1) * limit + donations.length)}</span> of{' '}
                      <span className="font-medium">{totalPages * limit}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          page === 1 ? 'text-gray-400' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {[...Array(totalPages).keys()].map(num => {
                        const pageNum = num + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-primary border-primary text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page === totalPages ? 'text-gray-400' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Status update modal */}
      {updateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Donation Status
              </h3>
              
              <form onSubmit={handleStatusUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donation ID</label>
                  <p className="text-sm text-gray-600">{selectedDonation?.donationId}</p>
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
                    <option value="approved">Approved</option>
                    <option value="processing">Processing</option>
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
    </div>
  );
};

export default DonationManagement;
