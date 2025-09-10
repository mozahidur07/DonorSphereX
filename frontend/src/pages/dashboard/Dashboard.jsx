import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import api, { apiGet } from '../../utils/api';
import useApi from '../../utils/useApi';
import PieChart from '../../components/charts/PieChart';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import StatsCard from '../../components/ui/StatsCard';
import DataTable from '../../components/ui/DataTable';
import StaffDashboardComponent from '../staff/StaffDashboard';
import './Dashboard.css';

// Mock data
const bloodDonationData = [
  { name: 'A+', value: 35.7 },
  { name: 'A-', value: 6.3 },
  { name: 'B+', value: 8.5 },
  { name: 'B-', value: 1.5 },
  { name: 'AB+', value: 3.4 },
  { name: 'AB-', value: 0.6 },
  { name: 'O+', value: 37.4 },
  { name: 'O-', value: 6.6 }
];

const organDonationData = [
  { name: 'Kidney', value: 45 },
  { name: 'Liver', value: 30 },
  { name: 'Heart', value: 10 },
  { name: 'Lungs', value: 8 },
  { name: 'Pancreas', value: 4 },
  { name: 'Other', value: 3 }
];

const monthlyDonationsData = [
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 59 },
  { label: 'Mar', value: 80 },
  { label: 'Apr', value: 81 },
  { label: 'May', value: 56 },
  { label: 'Jun', value: 55 },
  { label: 'Jul', value: 40 },
  { label: 'Aug', value: 94 }
];

const monthlyDonorsData = [
  { label: 'Jan', value: 42 },
  { label: 'Feb', value: 38 },
  { label: 'Mar', value: 55 },
  { label: 'Apr', value: 60 },
  { label: 'May', value: 48 },
  { label: 'Jun', value: 43 },
  { label: 'Jul', value: 35 },
  { label: 'Aug', value: 72 }
];

const recentDonations = [
  { id: 1, donor: 'John Doe', type: 'Blood', bloodType: 'A+', date: '2025-08-30', status: 'Completed' },
  { id: 2, donor: 'Jane Smith', type: 'Blood', bloodType: 'O-', date: '2025-08-29', status: 'Completed' },
  { id: 3, donor: 'Robert Brown', type: 'Organ', organ: 'Kidney', date: '2025-08-28', status: 'Scheduled' },
  { id: 4, donor: 'Emily Wilson', type: 'Blood', bloodType: 'B+', date: '2025-08-27', status: 'Completed' },
  { id: 5, donor: 'Michael Chen', type: 'Organ', organ: 'Liver', date: '2025-08-26', status: 'In Progress' }
];

const pendingRequests = [
  { id: 1, requester: 'City Hospital', type: 'Blood', bloodType: 'O-', urgency: 'Critical', date: '2025-08-30' },
  { id: 2, requester: 'Medical Center', type: 'Organ', organ: 'Heart', urgency: 'High', date: '2025-08-29' },
  { id: 3, requester: 'Regional Hospital', type: 'Blood', bloodType: 'AB+', urgency: 'Medium', date: '2025-08-28' },
  { id: 4, requester: 'Children\'s Hospital', type: 'Blood', bloodType: 'A-', urgency: 'High', date: '2025-08-27' }
];

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Donor', status: 'Active', registeredDate: '2025-05-12' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Donor', status: 'Active', registeredDate: '2025-06-18' },
  { id: 3, name: 'Robert Brown', email: 'robert@example.com', role: 'Staff', status: 'Active', registeredDate: '2025-04-30' },
  { id: 4, name: 'Emily Wilson', email: 'emily@example.com', role: 'Donor', status: 'Inactive', registeredDate: '2025-07-05' },
  { id: 5, name: 'Michael Chen', email: 'michael@example.com', role: 'Admin', status: 'Active', registeredDate: '2025-03-22' }
];

const donationColumns = [
  { header: 'Donor', accessor: 'donor' },
  { header: 'Type', accessor: 'type' },
  { 
    header: 'Details', 
    accessor: 'details',
    render: (row) => row.type === 'Blood' ? `Blood Type: ${row.bloodType}` : `Organ: ${row.organ}`
  },
  { header: 'Date', accessor: 'date' },
  { 
    header: 'Status', 
    accessor: 'status',
    render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.status === 'Completed' 
          ? 'bg-green-100 text-green-800' 
          : row.status === 'Scheduled' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-yellow-100 text-yellow-800'
      }`}>
        {row.status}
      </span>
    )
  }
];

const requestColumns = [
  { header: 'Requester', accessor: 'requester' },
  { header: 'Type', accessor: 'type' },
  { 
    header: 'Details', 
    accessor: 'details',
    render: (row) => row.type === 'Blood' ? `Blood Type: ${row.bloodType}` : `Organ: ${row.organ}`
  },
  { header: 'Date', accessor: 'date' },
  { 
    header: 'Urgency', 
    accessor: 'urgency',
    render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.urgency === 'Critical' 
          ? 'bg-red-100 text-red-800' 
          : row.urgency === 'High' 
            ? 'bg-orange-100 text-orange-800' 
            : 'bg-yellow-100 text-yellow-800'
      }`}>
        {row.urgency}
      </span>
    )
  }
];

const userColumns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { header: 'Role', accessor: 'role' },
  { 
    header: 'Status', 
    accessor: 'status',
    render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.status === 'Active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {row.status}
      </span>
    )
  },
  { header: 'Registration Date', accessor: 'registeredDate' }
];

const Dashboard = () => {
  // Initialize active role from localStorage or default to donor
  const [activeRole, setActiveRole] = useState(() => {
    const savedRole = localStorage.getItem('dashboardRole');
    if (savedRole) {
      return savedRole;
    }
    return 'donor';
  });
  const [isSwitching, setIsSwitching] = useState(false);
  const { currentUser } = useAuth();

  const userRoles = {
    donor: currentUser?.role?.donor ?? true,
    staff: currentUser?.role?.staff && currentUser?.staff_approval,
    admin: currentUser?.role?.admin ?? false
  };
  
  // Save active role to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboardRole', activeRole);
  }, [activeRole]);

  const handleSwitchRole = (role) => {
    if (activeRole !== role && userRoles[role]) {
      setIsSwitching(true);
      setTimeout(() => {
        setActiveRole(role);
        setTimeout(() => {
          setIsSwitching(false);
        }, 300);
      }, 300); 
    }
  };

  const AdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Users" 
          value="1,254" 
          change="12.5" 
          changeType="increase"
          bgColor="bg-blue-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatsCard 
          title="Total Donations" 
          value="856" 
          change="8.2" 
          changeType="increase"
          bgColor="bg-green-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />
        <StatsCard 
          title="Pending Requests" 
          value="24" 
          change="3.6" 
          changeType="decrease"
          bgColor="bg-red-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard 
          title="Lives Saved" 
          value="1,893" 
          change="15.3" 
          changeType="increase"
          bgColor="bg-purple-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
          <LineChart data={monthlyDonationsData} title="Monthly Donations" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
          <LineChart data={monthlyDonorsData} title="Monthly Donors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieChart 
              data={bloodDonationData} 
              title="Blood Types" 
              colors={['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899']} 
            />
            <PieChart 
              data={organDonationData} 
              title="Organ Donations" 
              colors={['#3b82f6', '#10b981', '#f97316', '#f59e0b', '#8b5cf6', '#6366f1']} 
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm w-full">
          <div className="p-4 bg-blue-50 rounded-md mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-800">Blood Donation Guidelines</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-1">• Blood can be donated every <strong>3 months</strong> (whole blood)</p>
                  <p className="mb-1">• Platelets can be donated every <strong>7 days</strong>, up to 24 times per year</p>
                  <p>• Plasma can be donated every <strong>28 days</strong></p>
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-4">Donation Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Average Donations</p>
              <p className="text-2xl font-bold text-green-700">62.5 / month</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Returning Donors</p>
              <p className="text-2xl font-bold text-blue-700">78%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">New Donors</p>
              <p className="text-2xl font-bold text-purple-700">+12% YoY</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Most Needed Type</p>
              <p className="text-2xl font-bold text-amber-700">O-</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable 
          columns={donationColumns} 
          data={recentDonations} 
          title="Recent Donations" 
        />
        <DataTable 
          columns={userColumns} 
          data={users} 
          title="Users" 
        />
      </div>
    </>
  );

  // Import the new StaffDashboard component


const StaffDashboard = () => {
  // Instead of rendering directly here, we'll use the dedicated component
  return <StaffDashboardComponent />;
};

  const DonorDashboard = () => {
    const [donationHistory, setDonationHistory] = useState([]);
    const [userRequests, setUserRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
      const fetchUserData = async () => {
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        setLoading(true);
        
        try {
          const userId = currentUser.userId;
          
          // Fetch user data from userStore
          const userDataResponse = await apiGet(`profile?_=${Date.now()}`, {
            headers: { 
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
           
          
          if (userDataResponse.data && userDataResponse.data.status === 'success') {
            setUserData(userDataResponse.data.data);
          }
          
          // Fetch donation history
          const donationsResponse = await apiGet('donations');
           
          
          if (donationsResponse.data && donationsResponse.data.status === 'success') {
            setDonationHistory(donationsResponse.data.data || []);
          }
           
          
          try { 
            const requestsResponse = await apiGet('requests', {
              params: { userId: userId },
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            });
             
            
            if (requestsResponse.data && requestsResponse.data.status === 'success') {
              setUserRequests(requestsResponse.data.data || []);
            }
          } catch (requestError) {
            console.error("Error fetching user requests:", requestError);
            
            // Fallback to the old endpoint if the first one fails
            try {
              const fallbackResponse = await apiGet(`requests/user/${userId}`, {
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
              });
               
              
              if (fallbackResponse.data && fallbackResponse.data.status === 'success') {
               
                setUserRequests(fallbackResponse.data.data || []);
              }
            } catch (fallbackError) {
              console.error("Fallback request also failed:", fallbackError);
            }
          }
          
        } catch (error) {
          console.error("Error fetching user dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }, [currentUser]);

    // Calculate metrics
    const completedDonations = donationHistory.filter(donation => donation.status === 'completed').length;
    const pendingDonations = donationHistory.filter(donation => donation.status === 'pending').length;
    const bloodDonations = donationHistory.filter(donation => 
      (donation.donationType || donation.type) === 'Blood' ||
      (donation.donationType || donation.type) === 'Blood Donation'
    ).length;
    
    // Calculate eligibility date for next donation (3 months after last donation)
    const calculateNextEligibilityDate = () => {
      if (donationHistory.length === 0) return null;
      
      // Get completed blood donations
      const completedBloodDonations = donationHistory.filter(
        donation => donation.status === 'completed' && 
        ((donation.donationType || donation.type) === 'Blood' || (donation.donationType || donation.type) === 'Blood Donation')
      );
      
      if (completedBloodDonations.length === 0) return null;
      
      // Sort by date, most recent first
      completedBloodDonations.sort((a, b) => {
        return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
      });
      
      // Get most recent donation
      const lastDonation = completedBloodDonations[0];
      const lastDonationDate = new Date(lastDonation.date || lastDonation.createdAt);
      
      // Add 3 months
      const nextEligibilityDate = new Date(lastDonationDate);
      nextEligibilityDate.setMonth(nextEligibilityDate.getMonth() + 3);
      
      return nextEligibilityDate;
    };
    
    const nextEligibilityDate = calculateNextEligibilityDate();
    const canDonateNow = nextEligibilityDate ? new Date() >= nextEligibilityDate : true;
    
    // Format date to display
    const formatDate = (date) => {
      if (!date) return 'Not available';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // Calculate badge status
    const getBadges = () => {
      const badges = [];
      
      // First time donor badge
      if (completedDonations > 0) {
        badges.push({
          name: "First Time",
          bgColor: "bg-red-100",
          textColor: "text-red-600",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )
        });
      }
      
      // Life Saver badge (3+ donations)
      if (completedDonations >= 3) {
        badges.push({
          name: "Life Saver",
          bgColor: "bg-blue-100",
          textColor: "text-blue-600",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        });
      }
      
      // Regular Donor badge (5+ donations)
      if (completedDonations >= 5) {
        badges.push({
          name: "Regular Donor",
          bgColor: "bg-green-100",
          textColor: "text-green-600",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        });
      }
      
      // Silver Badge (10+ donations)
      if (completedDonations >= 10) {
        badges.push({
          name: "Silver Donor",
          bgColor: "bg-gray-100",
          textColor: "text-gray-600",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )
        });
      }
      
      // Gold Badge (20+ donations)
      if (completedDonations >= 20) {
        badges.push({
          name: "Gold Donor",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-600",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )
        });
      }
      
      return badges;
    };
    
    const badges = getBadges();
    
    // Determine blood recipient info based on blood type
    const getBloodCompatibilityInfo = () => {
      const bloodType = userData?.bloodType || 'Unknown';
      
      const compatibilityMap = {
        'A+': { canReceiveFrom: ['A+', 'A-', 'O+', 'O-'], canDonateTo: ['A+', 'AB+'] },
        'A-': { canReceiveFrom: ['A-', 'O-'], canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
        'B+': { canReceiveFrom: ['B+', 'B-', 'O+', 'O-'], canDonateTo: ['B+', 'AB+'] },
        'B-': { canReceiveFrom: ['B-', 'O-'], canDonateTo: ['B+', 'B-', 'AB+', 'AB-'] },
        'AB+': { canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canDonateTo: ['AB+'] },
        'AB-': { canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'], canDonateTo: ['AB+', 'AB-'] },
        'O+': { canReceiveFrom: ['O+', 'O-'], canDonateTo: ['A+', 'B+', 'AB+', 'O+'] },
        'O-': { canReceiveFrom: ['O-'], canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }
      };
      
      if (bloodType in compatibilityMap) {
        return {
          bloodType,
          canDonateTo: compatibilityMap[bloodType].canDonateTo.join(', ')
        };
      } else {
        return {
          bloodType: 'Unknown',
          canDonateTo: 'Unknown (please update your profile with your blood type)'
        };
      }
    };
    
    const bloodInfo = getBloodCompatibilityInfo();

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-700">Loading your dashboard...</span>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Donations" 
            value={completedDonations.toString()}
            change={pendingDonations > 0 ? pendingDonations.toString() : null}
            changeType={pendingDonations > 0 ? 'pending' : null}
            changeLabel={pendingDonations > 0 ? 'Pending' : null}
            bgColor="bg-green-50"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          <StatsCard 
            title="Blood Donations" 
            value={bloodDonations.toString()}
            bgColor="bg-red-50"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            }
          />
          <StatsCard 
            title="Active Requests" 
            value={userRequests.filter(req => req.status === 'pending').length.toString()}
            bgColor="bg-blue-50"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatsCard 
            title="Lives Impacted" 
            value={(completedDonations * 3).toString()}
            bgColor="bg-purple-50"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Donation History</h3>
              <Link to="/donation/reports" className="text-sm text-primary hover:underline flex items-center">
                View All 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donationHistory.length > 0 ? (
                    donationHistory.slice(0, 5).map((donation, index) => (
                      <tr key={donation._id || donation.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(donation.date || donation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.location || donation.preferredHospital || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.donationType || donation.type || 'Blood'} 
                          {donation.donationSubType || donation.subType ? ` (${donation.donationSubType || donation.subType})` : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            donation.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            donation.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {donation.status === 'completed' ? 'Completed' : 
                             donation.status === 'rejected' ? 'Rejected' : 
                             'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No donation history available. Consider making your first donation!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Donation Eligibility</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Blood can be donated every 3 months. 
                      {nextEligibilityDate ? (
                        <> Your next donation eligibility date: <span className="font-semibold">{formatDate(nextEligibilityDate)}</span></>
                      ) : (
                        <> You are eligible to donate now!</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Your Impact</h3>
            <div>
              <p className="text-gray-600 mb-2">Blood Type: <span className="font-semibold">{bloodInfo.bloodType}</span></p>
              <p className="text-gray-600 mb-4">Your blood can help patients with blood types: <span className="font-semibold">{bloodInfo.canDonateTo}</span></p>
              <Link to="/donation/blood" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition inline-block">
                {canDonateNow ? 'Donate Now' : 'Schedule Donation'}
              </Link>
            </div>
            
            {completedDonations > 0 && (
              <div className="mt-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-green-800">Your Donation Impact</h3>
                      <p className="mt-2 text-sm text-green-700">
                        With {completedDonations} {completedDonations === 1 ? 'donation' : 'donations'}, you've potentially helped save up to {completedDonations * 3} lives. Each blood donation can save up to 3 lives!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Achievement Badges</h3>
            <div className="flex flex-wrap gap-6">
              {badges.length > 0 ? (
                badges.map((badge, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-16 h-16 ${badge.bgColor} rounded-full flex items-center justify-center ${badge.textColor} mb-2`}>
                      {badge.icon}
                    </div>
                    <span className="text-sm">{badge.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-center w-full p-4 bg-gray-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-600">Complete your first donation to earn badges!</p>
                  <Link to="/donation/blood" className="text-primary hover:underline inline-block mt-2">
                    Donate Now
                  </Link>
                </div>
              )}
            </div>

            {badges.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Next Badge</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {completedDonations < 3 ? (
                    <p className="text-sm text-gray-600">Complete {3 - completedDonations} more donation(s) to earn the <span className="font-semibold text-blue-600">Life Saver</span> badge!</p>
                  ) : completedDonations < 5 ? (
                    <p className="text-sm text-gray-600">Complete {5 - completedDonations} more donation(s) to earn the <span className="font-semibold text-green-600">Regular Donor</span> badge!</p>
                  ) : completedDonations < 10 ? (
                    <p className="text-sm text-gray-600">Complete {10 - completedDonations} more donation(s) to earn the <span className="font-semibold text-gray-600">Silver Donor</span> badge!</p>
                  ) : completedDonations < 20 ? (
                    <p className="text-sm text-gray-600">Complete {20 - completedDonations} more donation(s) to earn the <span className="font-semibold text-yellow-600">Gold Donor</span> badge!</p>
                  ) : (
                    <p className="text-sm text-gray-600">Congratulations! You've earned all the badges. Your contribution is making a huge difference!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Requests</h3>
              <Link to="/status" className="text-sm text-primary hover:underline flex items-center">
                View All 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userRequests.length > 0 ? (
                    [...userRequests].sort((a, b) => {
                      // Sort by date (newest first)
                      const dateA = new Date(a.createdAt || a.date);
                      const dateB = new Date(b.createdAt || b.date);
                      return dateB - dateA;
                    }).slice(0, 3).map((request, index) => (
                      <tr key={request._id || request.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(request.date || request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {/* Request type icon */}
                            {request.type === 'blood' || request.type === 'Blood Request' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            ) : request.type === 'organ' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                            )}
                            {request.type || request.requestType || 'Request'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request?.requestId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          { request.type === 'blood' || request.type === 'Blood Request' ? (
                            request.bloodGroup || request.bloodType || 'Not specified'
                          ) : request.type === 'organ' || request.type === 'Organ Request' ? (
                            request.organ || 'Not specified'
                          ) : (
                            'Not specified'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status === 'completed' ? 'Completed' : 
                             request.status === 'rejected' ? 'Rejected' : 
                             `${request.status}`}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No requests found. You can create a blood or organ request if needed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {userRequests.length === 0 && (
              <div className="mt-4 flex justify-center">
                <Link to="/requests/blood" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition mr-4">
                  Request Blood
                </Link>
                <Link to="/requests/organ" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                  Request Organ
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-8">
      <div className="flex mt-8 md:mt-0 flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center mt-1">
            <p className="text-gray-600 text-sm md:text-base">
              Welcome to your dashboard. 
            </p>
            <div className="ml-2 px-3 py-1 bg-gray-100 rounded-full flex items-center text-sm text-primary font-medium ">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-1 capitalize">{activeRole}</span> Role
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 role-switcher-wrapper">
          <div className="bg-white shadow-sm rounded-lg p-1 flex space-x-1">
            {userRoles.admin && (
              <button 
                onClick={() => handleSwitchRole('admin')}
                disabled={activeRole === 'admin'}
                className={`px-4 py-2 rounded-md flex items-center role-btn transition-colors ${activeRole === 'admin' ? 'bg-primary text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {activeRole === 'admin' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                Admin
              </button>
            )}
            {userRoles.staff && (
              <button 
                onClick={() => handleSwitchRole('staff')}
                disabled={activeRole === 'staff'}
                className={`px-4 py-2 rounded-md flex items-center role-btn transition-colors ${activeRole === 'staff' ? 'bg-primary text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {activeRole === 'staff' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                Staff
              </button>
            )}
            {userRoles.donor && (
              <button 
                onClick={() => handleSwitchRole('donor')}
                disabled={activeRole === 'donor'}
                className={`px-4 py-2 rounded-md flex items-center role-btn transition-colors ${activeRole === 'donor' ? 'bg-primary text-white font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {activeRole === 'donor' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                Donor
              </button>
            )}
          </div>
          <div className="role-switcher-tooltip">
            Switch between your available roles
          </div>
        </div>
      </div>
      
      <div className={`dashboard-content transition-all duration-300 ease-in-out ${isSwitching ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100 dashboard-switch-animation'}`}>
        {isSwitching && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <span className="text-gray-700 font-medium">Switching to {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Dashboard...</span>
            <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your dashboard.</p>
          </div>
        )}
        {!isSwitching && activeRole === 'admin' && <AdminDashboard />}
        {!isSwitching && activeRole === 'staff' && <StaffDashboard />}
        {!isSwitching && activeRole === 'donor' && <DonorDashboard />}
        
        {/* Message for users with staff role but without approval */}
        {!isSwitching && currentUser?.role?.staff && !currentUser?.staff_approval && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-yellow-800">Staff Access Pending</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Your staff role has been registered but is awaiting approval from an administrator.
                  You will be able to access the Staff Dashboard once your account is approved.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
