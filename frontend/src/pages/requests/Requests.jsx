import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

// Icons for status
const StatusIcon = ({ status }) => {
  if (status === 'completed') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  } else if (status === 'rejected') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  } else {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    );
  }
};

const RequestTypeIcon = ({ type }) => {
  switch (type) {
    case 'blood':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      );
    case 'Emergency Request':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'organ':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
        </svg>
      );
    case 'Special Campaign':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      );
    case 'Blood Request':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
          <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
        </svg>
      );
    case 'Volunteer Application':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
  }
};

const Requests = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const userId = currentUser.userId;
         
        if (!userId || !userId.startsWith('LD-')) {
          console.error('Invalid userId format:', userId);
          throw new Error('Invalid user ID format');
        } 
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Authentication token not found');
        }
         
         
        const response = await axios.get(`${API_URL}/requests`, {
          params: { 
            userId: userId 
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
         
        
        if (response.data.status === 'success') { 
          setRequests(response.data.data || []); 
        } else {
          throw new Error(response.data.message || 'Failed to fetch requests');
        }
      } catch (err) {
        console.error('Error fetching user requests:', err);
        setError(`Failed to load your requests: ${err.message}`);
         
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRequests();
  }, [currentUser]);

  const uniqueTypes = ['all', ...new Set(requests.map(req => req.type))];

  const filteredRequests = requests.filter(request => {

    if (filterStatus !== 'all' && request.status !== filterStatus) {
      return false;
    }

    if (filterType !== 'all' && request.type !== filterType) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (request.type && request.type.toLowerCase().includes(query)) ||
        (request.subType && request.subType.toLowerCase().includes(query)) ||
        (request.location && request.location.toLowerCase().includes(query)) ||
        (request.nearestHospital && request.nearestHospital.toLowerCase().includes(query)) ||
        (request.requestId && request.requestId.toLowerCase().includes(query)) ||
        (request._id && request._id.toString().toLowerCase().includes(query)) ||
        (request.id && request.id.toLowerCase().includes(query)) ||
        (request.patientName && request.patientName.toLowerCase().includes(query)) ||
        (request.notes && request.notes.toLowerCase().includes(query)) ||
        (request.medicalNotes && request.medicalNotes.toLowerCase().includes(query))
      );
    }
    
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date);
    const dateB = new Date(b.createdAt || b.date);
    
    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Request History</h1>
          
          {!currentUser && !loading && (
            <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Please log in to view your request history</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You need to be logged in to view your request history.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  id="filter-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {uniqueTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 px-2 py-2 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search requests by id..."
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center bg-white shadow p-8 sm:rounded-md">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg font-medium text-gray-700">Loading your requests...</span>
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-red-50 p-4 sm:rounded-md border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  <div className="mt-2">
                    <button 
                      onClick={() => window.location.reload()}
                      className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!loading && !error && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y-2 divide-dashed divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <li key={request._id || request.requestId || request.id}>
                      <button 
                        className="block hover:bg-gray-50 w-full text-left"
                        onClick={() => handleRequestClick(request)}
                      >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <RequestTypeIcon type={request.type} />
                            <p className="ml-2 text-sm font-medium text-gray-900">{request.type}</p>
                            <p className="ml-2 text-sm text-gray-500">{request.subType}</p>
                          </div>
                          <div className="flex items-center">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusBadgeStyle(request.status)}`}>
                              <StatusIcon status={request.status} />
                              <span className="ml-1 capitalize">{request.status}</span>
                            </p>
                            <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              {request.location || request.nearestHospital || 'N/A'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <p>
                              {request.createdAt ? format(new Date(request.createdAt), 'MMM dd, yyyy') : (
                                request.date ? format(new Date(request.date), 'MMM dd, yyyy') : 'N/A'
                              )}
                            </p>
                          </div>
                        </div>
                        {request.status === 'rejected' && (
                          <div className="mt-2">
                            <p className="text-sm text-red-600">{request.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-gray-500">No requests found matching your criteria.</p>
                  {filterStatus !== 'all' || filterType !== 'all' || searchQuery ? (
                    <button 
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterType('all');
                        setSearchQuery('');
                      }}
                      className="mt-2 text-blue-500 hover:text-blue-700 underline"
                    >
                      Clear filters
                    </button>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400">You haven't made any requests yet</p>
                  )}
                </li>
              )}
            </ul>
          </div>
          )}
        </div>
      </div>
      
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 backdrop-blur-sm"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
           
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-semibold text-white flex items-center" id="modal-title">
                  <RequestTypeIcon type={selectedRequest.type} />
                  <span className="ml-2">Request Details</span>
                </h3>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-white px-6 pt-5 pb-6">
                <div className="flex justify-center mb-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                    selectedRequest.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    selectedRequest.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <StatusIcon status={selectedRequest.status} />
                    <span className="ml-1 capitalize">{selectedRequest.status}</span>
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Request ID</p>
                    <p className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">{selectedRequest.requestId || selectedRequest.id || 'N/A'}</p>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <div className="flex items-center">
                      <RequestTypeIcon type={selectedRequest.type} />
                      <p className="ml-1 text-sm font-bold text-gray-900">{selectedRequest.type} - {selectedRequest.subType}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                    <div className="flex items-center text-blue-600">
                      <svg className="flex-shrink-0 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium">
                        {selectedRequest.createdAt ? format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy') : (
                          selectedRequest.date ? format(new Date(selectedRequest.date), 'MMM dd, yyyy') : 'N/A'
                        )} {selectedRequest.createdAt && format(new Date(selectedRequest.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.location || selectedRequest.nearestHospital}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.isForSelf === false && selectedRequest.patientName && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Patient Name</p>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-blue-600">{selectedRequest.patientName}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.rejectionReason && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                      <p className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-lg">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}
                  
                  {selectedRequest.urgency && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Urgency</p>
                      <p className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">{selectedRequest.urgency}</p>
                    </div>
                  )}
                  
                  {selectedRequest.recipientType && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Recipient Type</p>
                      <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{selectedRequest.recipientType}</p>
                    </div>
                  )}
                  
                  {selectedRequest.scheduledDate && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Scheduled Date</p>
                      <div className="flex items-center text-green-600">
                        <svg className="flex-shrink-0 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">
                          {format(new Date(selectedRequest.scheduledDate), 'MMM dd, yyyy')} at {format(new Date(selectedRequest.scheduledDate), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.notes && (
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                        <p>{selectedRequest.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
