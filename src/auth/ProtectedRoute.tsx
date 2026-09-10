import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Cosmetic gate only — the backend's requireRole('ADMIN') is what actually enforces access.
// A non-admin with a valid token would still get 403s from every call past this point.
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
