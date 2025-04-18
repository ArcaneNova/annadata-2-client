import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '@/utils/auth';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const isLoggedIn = isAuthenticated();
  const userRole = getUserRole();

  if (isLoggedIn && userRole) {
    // Redirect authenticated users to their respective dashboards
    return <Navigate to={`/dashboard/${userRole}`} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute; 