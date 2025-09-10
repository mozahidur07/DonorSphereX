import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

 
const ProtectedRoute = ({ children, requiredRoles = [], requireStaffApproval = false }) => {
  const auth = useAuth();
  const { isAuthenticated, hasRole, loading, currentUser } = auth;
  const location = useLocation();
  
 
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <p className="ml-3 text-red-600 font-medium">Verifying authentication...</p>
      </div>
    );
  }
 
  const token = localStorage.getItem('authToken');
  const isAuth = !!currentUser && !!token;
  
 
  if (!isAuth) {
    console.log('Not authenticated, redirecting to signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
 
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) { 
      return <Navigate to="/unauthorized" replace />;
    }
  }
   if (requireStaffApproval && (!currentUser?.role?.staff || !currentUser?.staff_approval)) {
    return <Navigate to="/dashboard" replace />;
  }
 
  return children;
};

export default ProtectedRoute;
