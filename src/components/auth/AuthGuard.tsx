import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/LoadingState';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard - Flexible authentication guard component
 * Can protect routes or redirect authenticated users
 */
export function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState />;
  }

  // Require authentication
  if (requireAuth && !user) {
    return <Navigate to={redirectTo || '/auth'} state={{ returnTo: location.pathname }} replace />;
  }

  // Require NO authentication (for auth pages)
  if (!requireAuth && user) {
    return <Navigate to={redirectTo || '/dashboard'} replace />;
  }

  return <>{children}</>;
}
