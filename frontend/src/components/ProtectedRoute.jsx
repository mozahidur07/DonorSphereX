import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper component for routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute = ({ children, requiredRoles = [], requireStaffApproval = false }) => {
  const auth = useAuth();
  const { isAuthenticated, hasRole, loading, currentUser } = auth;
  const location = useLocation();
  
  // console.log('ProtectedRoute - Full Auth Context:', { 
  //   loading,
  //   authChecked: auth.authChecked,
  //   currentUser,
  //   token: localStorage.getItem('authToken')
  // });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <p className="ml-3 text-red-600 font-medium">Verifying authentication...</p>
      </div>
    );
  }

  // Check auth directly without using the function to debug
  const token = localStorage.getItem('authToken');
  const isAuth = !!currentUser && !!token;
  
  // console.log('ProtectedRoute - Auth check:', { 
  //   isAuthFunction: isAuthenticated(),
  //   isAuthDirect: isAuth,
  //   currentUser,
  //   token
  // });
  
  if (!isAuth) {
    console.log('Not authenticated, redirecting to signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check for required roles if specified
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Check if staff approval is required
  if (requireStaffApproval && (!currentUser?.role?.staff || !currentUser?.staff_approval)) {
    // Redirect to dashboard if user is not approved staff
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required roles, render the children
  return children;
};

export default ProtectedRoute;
