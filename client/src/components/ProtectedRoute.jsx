import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle onboarding for new users
  // If profileCompleted is false explicitly, they must complete onboarding
  if (user && user.profileCompleted === false && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }
  
  // Prevent users who have completed onboarding from accessing the onboarding route
  if (user && user.profileCompleted !== false && location.pathname === '/complete-profile') {
    return <Navigate to="/notes" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
