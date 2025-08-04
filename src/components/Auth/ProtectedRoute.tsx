import { useAuth } from '@/contexts/AuthContext';
import { ALLOWED_ROLES } from '@/types/auth';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

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
        display="flex"
        justifyContent="center"
        alignItems="center"
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
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this application.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
