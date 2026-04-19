import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { Role } from '../types/api.types';

interface RoleGuardProps {
  role: Role;
}

export function RoleGuard({ role }: RoleGuardProps) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
