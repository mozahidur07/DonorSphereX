import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom'; 


// Status icon component
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

// Donation type icon
const DonationTypeIcon = ({ type }) => {
  if (type === 'Blood Donation' || type === 'Blood') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    );
  } else {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    );
  }
};

const DonationReports = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchDonationReports = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await axios.get(`${API_URL}/donations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.data.status === 'success') {
          // If no donations yet, use sample data for demonstration
          const donations = response.data.data.length > 0 
            ? response.data.data 
            : [];
            
          setReports(donations);
        } else {
          setError('Failed to fetch donation reports');
        }
      } catch (err) {
        console.error('Error fetching donation reports:', err);
        setError('Failed to fetch donation reports. Please try again later.');
        // Use sample data as fallback
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonationReports();
  }, [currentUser]);

  // Get unique donation types for filter dropdown
  const uniqueTypes = ['all', ...new Set(reports.map(report => report.donationType || report.type))];

  // Filter and sort reports based on user selections
  const filteredReports = reports.filter(report => {
    // Filter by status
    if (filterStatus !== 'all' && report.status !== filterStatus) {
      return false;
    }
    
    // Filter by type - handle both standard format and MongoDB format
    const reportType = report.donationType || report.type;
    if (filterType !== 'all' && reportType !== filterType) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (reportType && reportType.toLowerCase().includes(query)) ||
        (report.donationSubType || report.subType || '').toLowerCase().includes(query) ||
        (report.location || '').toLowerCase().includes(query) ||
        (report.preferredHospital || '').toLowerCase().includes(query) ||
        (report.additionalNotes || report.notes || '').toLowerCase().includes(query) ||
        (report.donationId || report.id || '').toLowerCase().includes(query)
      );
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by date (handle both formats)
    const dateA = new Date(a.date || a.createdAt || a.donationDate);
    const dateB = new Date(b.date || b.createdAt || b.donationDate);
    
    if (sortOrder === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  // Function to get status badge style
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Donation Reports</h1>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-700">Loading donation reports...</span>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Not logged in message */}
          {!loading && !currentUser && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4 3a1 1 0 00-1-1H9a1 1 0 100 2h3a1 1 0 001-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please <a href="/auth/signin" className="font-medium underline text-yellow-700 hover:text-yellow-600">sign in</a> to view your donation reports.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* No donations yet message */}
          {!loading && currentUser && reports.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No donation reports yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't made any donations yet. Consider donating blood or registering for organ donation.
              </p>
              <div className="mt-6">
                <div className="flex space-x-3 justify-center">
                  <Link to="/donation/blood" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Donate Blood
                  </Link>
                  <Link to="/donation/organ" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Organ Donation
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Filters and Search */}
          {!loading && currentUser && reports.length > 0 && (
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
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-2 pr-10 sm:text-sm border-gray-300  rounded-md"
                    placeholder="Search reports by id..."
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
          )}
          
          {/* Report List */}
          {!loading && currentUser && reports.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y-2 divide-dashed divide-gray-200">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <li key={report.id}>
                    <button 
                      className="block hover:bg-gray-50 w-full text-left"
                      onClick={() => handleReportClick(report)}
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DonationTypeIcon type={report.donationType || report.type} />
                            <p className="ml-2 text-sm font-medium text-gray-900">{report.donationType || report.type}</p>
                            <p className="ml-2 text-sm text-gray-500">{report.donationSubType || report.subType}</p>
                          </div>
                          <div className="flex items-center">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusBadgeStyle(report.status)}`}>
                              <StatusIcon status={report.status} />
                              <span className="ml-1 capitalize">{report.status}</span>
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
                              {report.location || report.preferredHospital || 'Not specified'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <p>
                              {format(new Date(report.date || report.createdAt || new Date()), 'MMM dd, yyyy')} at {format(new Date(report.date || report.createdAt || new Date()), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        {report.status === 'rejected' && (
                          <div className="mt-2">
                            <p className="text-sm text-red-600">{report.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-gray-500">
                  No reports found matching your criteria.
                </li>
              )}
            </ul>
          </div>
          )}
        </div>
      </div>
      
      {/* Detail Modal */}
      {isDetailModalOpen && selectedReport && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 backdrop-blur-sm"></div>
            </div>
            
            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
              {/* Modal header with gradient */}
              <div className={`bg-gradient-to-r ${
                (selectedReport.donationType === 'Blood' || selectedReport.type === 'Blood Donation')
                ? 'from-red-600 to-red-800' 
                : 'from-green-600 to-green-800'
              } px-6 py-4 flex justify-between items-center`}>
                <h3 className="text-lg leading-6 font-semibold text-white flex items-center" id="modal-title">
                  <DonationTypeIcon type={selectedReport.donationType || selectedReport.type} />
                  <span className="ml-2">Donation Report Details</span>
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
                {/* Status badge at top */}
                <div className="flex justify-center mb-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                    selectedReport.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    selectedReport.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <StatusIcon status={selectedReport.status} />
                    <span className="ml-1 capitalize">{selectedReport.status}</span>
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Report ID</p>
                    <p className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">{selectedReport.donationId || selectedReport.id}</p>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <div className="flex items-center">
                      <DonationTypeIcon type={selectedReport.donationType || selectedReport.type} />
                      <p className="ml-1 text-sm font-bold text-gray-900">{selectedReport.donationType || selectedReport.type} - {selectedReport.donationSubType || selectedReport.subType}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                    <div className="flex items-center text-blue-600">
                      <svg className="flex-shrink-0 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium">
                        {format(new Date(selectedReport.date || selectedReport.createdAt || new Date()), 'MMM dd, yyyy')} at {format(new Date(selectedReport.date || selectedReport.createdAt || new Date()), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">{selectedReport.location || selectedReport.preferredHospital || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <p className="text-sm font-medium text-gray-500">Blood Type</p>
                    <p className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-lg">{selectedReport.bloodType || selectedReport.donorBloodType || 'Not specified'}</p>
                  </div>
                  
                  {/* Show donor's name when donation is for self */}
                  {(selectedReport.isForSelf === true || selectedReport.isForSelf === undefined) && selectedReport.userName && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Donor Name</p>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-green-600">{selectedReport.userName}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Show patient name when donation is for someone else */}
                  {selectedReport.isForSelf === false && selectedReport.patientName && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Donor  Name</p>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-blue-600">{selectedReport.patientName}</p>
                      </div>
                    </div>
                  )}
                  
                  {(selectedReport.age || selectedReport.donorAge) && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Donor Age</p>
                      <p className="text-sm font-medium text-gray-900">{selectedReport.age || selectedReport.donorAge} years</p>
                    </div>
                  )}
                  
                  {selectedReport.rejectionReason && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                      <p className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-lg">{selectedReport.rejectionReason}</p>
                    </div>
                  )}
                  
                  {selectedReport.statusNotes && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Status Notes</p>
                      <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{selectedReport.statusNotes}</p>
                    </div>
                  )}
                  
                  {selectedReport.nextAppointment && (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500">Next Appointment</p>
                      <div className="flex items-center text-green-600">
                        <svg className="flex-shrink-0 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">
                          {format(new Date(selectedReport.nextAppointment), 'MMM dd, yyyy')} at {format(new Date(selectedReport.nextAppointment), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(selectedReport.notes || selectedReport.additionalNotes) && (
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                        <p>{selectedReport.notes || selectedReport.additionalNotes}</p>
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

export default DonationReports;
