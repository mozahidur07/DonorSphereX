import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/ui/StatsCard';
import axios from 'axios';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDonations: 0,
    totalRequests: 0,
    completedDonations: 0,
    pendingRequests: 0,
    kycPending: 0,
    kycCompleted: 0
  });
  
  // Recent data states
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  
  // KYC verification states
  const [pendingKycUserIds, setPendingKycUserIds] = useState([]);
  const [pendingKycUsers, setPendingKycUsers] = useState([]);
  const [completedKycUsers, setCompletedKycUsers] = useState([]);
  const [activeKycTab, setActiveKycTab] = useState('pending'); // 'pending' or 'completed'

  useEffect(() => {
    // Verify staff permissions
    if (!currentUser?.role?.staff || !currentUser?.staff_approval) {
      navigate('/dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [currentUser]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('authToken');
      
      // Fetch dashboard stats
      const dashboardResponse = await axios.get(`${API_URL}/staff/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (dashboardResponse.data.status === 'success') {
        const data = dashboardResponse.data.data; 
        
        setStats({
          totalUsers: data.userCount || 0,
          activeUsers: data.activeUsersCount || 0,
          totalDonations: data.donationCount || 0,
          totalRequests: data.requestCount || 0,
          completedDonations: data.completedDonations || 0,
          pendingRequests: data.pendingRequests || 0,
          kycPending: data.kycPendingCount || 0,
          kycCompleted: data.kycCompletedCount || 0
        });
        
        setRecentUsers(data.recentUsers || []); 

        setRecentDonations(data.recentDonations || []);
        setRecentRequests(data.recentRequests || []);
        
        // Store the list of user IDs with pending KYC verification
        if (data.pendingKycUserIds && data.pendingKycUserIds.length > 0) { 
          setPendingKycUserIds(data.pendingKycUserIds);
        }
        
        // Store the detailed list of users with pending KYC verification
        if (data.pendingKycUsers && data.pendingKycUsers.length > 0) { 
          setPendingKycUsers(data.pendingKycUsers);
        }
        
        // Store the list of users with completed KYC verification
        if (data.completedKycUsers && data.completedKycUsers.length > 0) { 
          setCompletedKycUsers(data.completedKycUsers);
        }
        
        // No chart data processing needed
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      
      // Don't use mock data, show the error to the user
      return;
    } finally {
      setLoading(false);
    }
  };
  

  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-700">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">Monitor and manage donations, requests, and users</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatsCard 
            title="Total Users" 
            value={stats.totalUsers}
            icon={
              <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatsCard 
            title="Total Donations" 
            value={stats.totalDonations}
            icon={
              <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatsCard 
            title="Total Requests" 
            value={stats.totalRequests}
            icon={
              <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
          <StatsCard 
            title="Completed Donations" 
            value={stats.completedDonations}
            icon={
              <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatsCard 
            title="Pending Requests" 
            value={stats.pendingRequests}
            icon={
              <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
          <Link to="#" className={stats.kycPending > 0 ? "relative " : ""}>
            <StatsCard 
              title={<span className="flex items-center">
                Pending KYC
                {stats.kycPending > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    Attention
                  </span>
                )}
              </span>}
              value={stats.kycPending}
              icon={
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              bgColor={stats.kycPending > 0 ? "bg-orange-100" : "bg-orange-50"}
              textColor="text-orange-600"
              borderColor={stats.kycPending > 0 ? "border-orange-400" : ""}
            />
          </Link>
        </div>
        
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border border-blue-300">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600 mb-4">
                View and manage user profiles, verify KYC documents, and update user status.
              </p>
            </div>
            <div>
              <Link to="/staff/users" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                Manage Users
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border border-green-300">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Donation Management</h3>
              <p className="text-gray-600 mb-4">
                Process donation records, update donation status, and generate donation reports.
              </p>
            </div>
            <div>
              <Link to="/staff/donations" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                Manage Donations
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border border-purple-300">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Request Management</h3>
              <p className="text-gray-600 mb-4">
                Review donation requests, update request status, and match donors to requests.
              </p>
            </div>
            <div>
              <Link to="/staff/requests" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none">
                Manage Requests
              </Link>
            </div>
          </div>
        </div>
        
        {/* Charts section removed as requested */}
        
        {/* KYC Pending Users Section */}
        <div id="pending-kyc-section" className="grid grid-cols-1 gap-6 mb-6">
          <div className={`bg-white p-6 rounded-lg shadow-md border-2 ${stats.kycPending > 0 ? 'border-orange-500' : 'border-orange-300'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-orange-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                KYC Verifications 
                <span className="ml-2 bg-orange-100 text-orange-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                  Pending: {stats.kycPending}
                </span>
                <span className="ml-2 bg-green-100 text-green-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                  Completed: {stats.kycCompleted}
                </span>
              </h3>
              <Link to="/staff/users" className="text-blue-600 hover:text-blue-800 hover:underline text-sm bg-blue-50 px-3 py-2 rounded">
                View All Users
              </Link>
            </div>
            
            {/* KYC Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex">
                <button
                  className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm mr-8 ${
                    activeKycTab === 'pending'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveKycTab('pending')}
                >
                  Pending KYC ({stats.kycPending})
                </button>
                <button
                  className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm ${
                    activeKycTab === 'completed'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveKycTab('completed')}
                >
                  Completed KYC ({stats.kycCompleted})
                </button>
              </nav>
            </div>
            
            {/* Pending KYC Tab Content */}
            {activeKycTab === 'pending' && (
              <>
                {(pendingKycUsers && pendingKycUsers.length > 0) ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingKycUsers.slice(0, 5).map((user, index) => (
                          <tr key={`kyc-user-${index}`} className="hover:bg-yellow-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || user.userId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{user.email || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                {user.kycStatus || 'pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/staff/users/${user.userId}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Review KYC
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pendingKycUsers.length > 5 && (
                      <div className="mt-3 text-center">
                        <Link to="/staff/users" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                          View {pendingKycUsers.length - 5} more users with pending KYC
                        </Link>
                      </div>
                    )}
                  </div>
                ) : pendingKycUserIds && pendingKycUserIds.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingKycUserIds.slice(0, 5).map((userId, index) => (
                          <tr key={`kyc-id-${index}`} className="hover:bg-yellow-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {userId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/staff/users/${userId}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Review KYC
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pendingKycUserIds.length > 5 && (
                      <div className="mt-3 text-center">
                        <Link to="/staff/users" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                          View {pendingKycUserIds.length - 5} more users with pending KYC
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No users with pending KYC verification.</p>
                )}
              </>
            )}
            
            {/* Completed KYC Tab Content */}
            {activeKycTab === 'completed' && (
              <>
                {(completedKycUsers && completedKycUsers.length > 0) ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {completedKycUsers.slice(0, 5).map((user, index) => (
                          <tr key={`kyc-user-${index}`} className="hover:bg-green-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || user.userId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{user.email || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {user.kycStatus === 'approved' ? 'approved' : 'completed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/staff/users/${user.userId}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                View Profile
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {completedKycUsers.length > 5 && (
                      <div className="mt-3 text-center">
                        <Link to="/staff/users" className="text-blue-600 hover:text-blue-800 hover:underline text-sm">
                          View {completedKycUsers.length - 5} more users with completed KYC
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No users with completed KYC verification.</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            
            <div className="mb-6">
              <h4 className="text-sm uppercase font-medium text-gray-500 mb-3">Recent Users</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user, index) => (
                      <tr key={user._id || `user-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || ''} 
                          </div>
                        </td> 
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={user._id ? `/staff/users/${user.userId}` : `/staff/users`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm uppercase font-medium text-gray-500 mb-3">Recent Donations</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentDonations.map((donation, index) => (
                      <tr key={donation._id || `donation-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.userName || donation.userId || 'Unknown User'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.donationType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            !donation.status ? 'bg-gray-100 text-gray-800' :
                            donation.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            donation.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {!donation.status ? 'Unknown' :
                             donation.status === 'completed' ? 'Completed' : 
                             donation.status === 'rejected' ? 'Rejected' : 
                             donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(donation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link to="/staff/donations"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm uppercase font-medium text-gray-500 mb-3">Recent Requests</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRequests.map((request, index) => (
                      <tr key={request._id || `request-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.userObjectId?.fullName} {request.userObjectId?.lastName || request.userId || 'Unknown User'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            !request.urgency ? 'bg-gray-100 text-gray-800' :
                            request.urgency === 'critical' ? 'bg-red-100 text-red-800' : 
                            request.urgency === 'high' ? 'bg-orange-100 text-orange-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.urgency || 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            !request.status ? 'bg-gray-100 text-gray-800' :
                            request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {!request.status ? 'Unknown' :
                             request.status === 'completed' ? 'Completed' : 
                             request.status === 'rejected' ? 'Rejected' : 
                             request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to="/staff/requests"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
