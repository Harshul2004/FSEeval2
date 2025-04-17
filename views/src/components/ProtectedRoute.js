import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/auth/login" replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !hasRole(roles)) {
    console.log('Insufficient permissions');
    return <Navigate to="/" replace />;
  }

  // Render children or outlet
  return children || <Outlet />;
};

export default ProtectedRoute;