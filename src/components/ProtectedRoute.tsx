import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  const userRole = getUserRole();

  // If user is not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not in allowed roles, redirect to their dashboard
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    const dashboardPath = `/dashboard/${userRole}`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 