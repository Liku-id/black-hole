import { Box, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ALLOWED_ROLES } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the intended route for redirect after login
      const currentPath = router.asPath;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Check if user has an allowed role
      if (!ALLOWED_ROLES.includes(user.role)) {
        router.replace('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user has an allowed role
  if (user && !ALLOWED_ROLES.includes(user.role)) {
    return (
      <Box
        alignItems="center"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography gutterBottom variant="h4">
          Access Denied
        </Typography>
        <Typography color="text.secondary" variant="body1">
          You don't have permission to access this application.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
