
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import WebsiteChatInterface from './components/WebsiteChatInterface';
import ProtectedRoute from './components/ProtectedRoute';
import UserDataLoader from './components/UserDataLoader';
import { AuthProvider, useAuth } from './context/AuthContext';
import ApiDebugger from './utils/ApiDebugger';


// Pages
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/dashboard/Dashboard';
import Notifications from './pages/notifications/Notifications';
import Terms from './pages/Terms';
import Privacy from './pages/PrivacyPolicy';
import Support from './pages/support/Support';
import Profile from './pages/profile/Profile';
import Requests from './pages/requests/Requests';
import BloodRequest from './pages/requests/BloodRequest';
import OrganRequest from './pages/requests/OrganRequest';

// Donation Pages
import BloodDonation from './pages/donation/BloodDonation';
import OrganDonation from './pages/donation/OrganDonation';
import DonationReports from './pages/donation/DonationReports';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import UserManagement from './pages/staff/UserManagement';
import UserProfile from './pages/staff/UserProfile';
import DonationManagement from './pages/staff/DonationManagement';
import RequestManagement from './pages/staff/RequestManagement';



// Main app content component
const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAuth();
  

  const showSidebar = isAuthenticated() && 
                      !location.pathname.includes('/signin') && 
                      !location.pathname.includes('/signup') && 
                      !location.pathname.includes('/terms') && 
                      !location.pathname.includes('/privacy');
                      
  const showNavbar = !isAuthenticated() && location.pathname === '/';
  
  const showFooter = !location.pathname.includes('/signin') && 
                    !location.pathname.includes('/signup');

  const userId = currentUser?.userId || '';
  
  
  // Determine whether to show chat interface
  const showChatInterface = !location.pathname.includes('/support');

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <div className="">
          <Sidebar />
        </div>
      )}
      <div className={`flex flex-col min-h-screen ${showSidebar ? 'md:ml-16' : ''} w-full`}>
        {showNavbar && <Navbar />}
        <main className="flex-grow">
          {/* API Debugger for development */}
          <ApiDebugger />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/reporting/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/status" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/requests/blood" element={<ProtectedRoute><BloodRequest /></ProtectedRoute>} />
            <Route path="/requests/organ" element={<ProtectedRoute><OrganRequest /></ProtectedRoute>} />
            
            {/* Donation Routes */}
            <Route path="/donation/blood" element={<ProtectedRoute><BloodDonation /></ProtectedRoute>} />
            <Route path="/donation/organ" element={<ProtectedRoute><OrganDonation /></ProtectedRoute>} />
            <Route path="/donation/reports" element={<ProtectedRoute><DonationReports /></ProtectedRoute>} />
            
            {/* Staff Routes - These will be accessible only to users with staff role & approval */}
            <Route path="/staff/dashboard" element={<ProtectedRoute requireStaffApproval={true}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/users" element={<ProtectedRoute requireStaffApproval={true}><UserManagement /></ProtectedRoute>} />
            <Route path="/staff/users/:userId" element={<ProtectedRoute requireStaffApproval={true}><UserProfile /></ProtectedRoute>} />
            <Route path="/staff/donations" element={<ProtectedRoute requireStaffApproval={true}><DonationManagement /></ProtectedRoute>} />
            <Route path="/staff/requests" element={<ProtectedRoute requireStaffApproval={true}><RequestManagement /></ProtectedRoute>} />
            
            <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </main>
        {showFooter && <Footer />}
        
        {/* Floating Chat Interface */}
        {showChatInterface && <WebsiteChatInterface userId={userId} />}
      </div>
    </div>
  );
}

// Main App component that wraps everything with AuthProvider and UserDataLoader
function App() {
  return (
    <AuthProvider>
      <UserDataLoader>
        <AppContent />
      </UserDataLoader>
    </AuthProvider>
  );
}

export default App;
