import React, { useEffect, useState } from 'react';
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
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Get route configuration
  const config = routeConfig[location.pathname];

  useEffect(() => {
    const determineRedirect = () => {
      // Handle unknown routes
      if (!config) {
        setRedirectPath('/user-type-selection');
        return;
      }

      // If user is not in the required state, redirect appropriately
      if (authStatus.state !== config.requiredState) {
        switch (authStatus.state) {
          case UserState.UNAUTHENTICATED:
            setRedirectPath('/login');
            break;
          case UserState.UNVERIFIED:
            setRedirectPath('/verify-email');
            break;
          case UserState.UNREGISTERED:
            setRedirectPath('/user-type-selection');
            break;
          case UserState.INCOMPLETE:
            setRedirectPath(`/${authStatus.role}-registration`);
            break;
          case UserState.COMPLETE:
            // Special case for super admin
            if (authStatus.role === 'superAdmin') {
              setRedirectPath('/super-admin-dashboard');
            } else {
              setRedirectPath(`/${authStatus.role}-dashboard`);
            }
            break;
          default:
            setRedirectPath('/login');
        }
        return;
      }

      // Check role-based access
      if (
        config.allowedRoles &&
        (!authStatus.role || !config.allowedRoles.includes(authStatus.role))
      ) {
        // If user has a role but isn't allowed, send them to their appropriate dashboard
        if (authStatus.role) {
          setRedirectPath(`/${authStatus.role}-dashboard`);
        } else {
          setRedirectPath('/login');
        }
        return;
      }

      // No redirect needed
      setRedirectPath(null);
    };

    determineRedirect();
  }, [authStatus.state, authStatus.role, location.pathname, config]);

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

  // Perform redirect if needed
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // All checks passed, render the protected component
  return <>{children}</>;
};

export default AccessGuard;
