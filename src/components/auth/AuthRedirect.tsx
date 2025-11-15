import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/LoadingState';

interface AuthRedirectProps {
  children: React.ReactNode;
}

/**
 * AuthRedirect - Smart redirect component for welcome/landing pages
 * Redirects authenticated users to dashboard, shows children for unauthenticated users
 */
export function AuthRedirect({ children }: AuthRedirectProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
