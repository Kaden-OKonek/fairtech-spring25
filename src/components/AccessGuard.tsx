import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { routeConfig } from '../config/routes.config';
import { UserState } from '../types/auth.types';

interface AccessGuardProps {
  children: React.ReactNode;
}

const AccessGuard: React.FC<AccessGuardProps> = ({ children }) => {
  const { authStatus } = useAuth();
  const location = useLocation();

  // Get route configuration
  const config = routeConfig[location.pathname];

  // Debug logging
  console.log('Current Path:', location.pathname);
  console.log('Auth Status:', authStatus);
  console.log('Route Config:', config);

  // Handle unknown routes
  if (!config) {
    console.log('No route config found, redirecting to user type selection');
    return <Navigate to="/user-type-selection" replace />;
  }

  // Show loading state
  if (authStatus.isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography>Loading user data...</Typography>
      </Box>
    );
  }

  // Determine the appropriate redirect based on user state
  const getRedirectPath = () => {
    switch (authStatus.state) {
      case UserState.UNAUTHENTICATED:
        return '/login';
      case UserState.UNVERIFIED:
        return '/verify-email';
      case UserState.UNREGISTERED:
        return '/user-type-selection';
      case UserState.INCOMPLETE:
        return `/${authStatus.role}-registration`;
      case UserState.COMPLETE:
        return `/${authStatus.role}-dashboard`;
      default:
        return '/login';
    }
  };

  // Check if current path matches user state
  if (authStatus.state !== config.requiredState) {
    const redirectPath = getRedirectPath();
    console.log(
      `Redirecting to ${redirectPath} based on user state ${authStatus.state}`
    );
    return <Navigate to={redirectPath} replace />;
  }

  // Check role-based access
  if (
    config.allowedRoles &&
    (!authStatus.role || !config.allowedRoles.includes(authStatus.role))
  ) {
    console.log(
      'Role mismatch. Required:',
      config.allowedRoles,
      'Current:',
      authStatus.role
    );
    const redirectPath = getRedirectPath();
    return <Navigate to={redirectPath} replace />;
  }

  // All checks passed, render the protected component
  return <>{children}</>;
};

export default AccessGuard;
