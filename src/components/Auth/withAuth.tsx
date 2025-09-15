import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

interface WithAuthOptions {
  requireAuth?: boolean;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { requireAuth = true, redirectTo = '/login' } = options;

  const WithAuthComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If authentication is required and user is not authenticated
      if (requireAuth && !isLoading && !isAuthenticated) {
        const currentPath = router.asPath;
        router.replace(
          `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
        );
      }

      // If user is authenticated and trying to access login page, redirect to dashboard
      if (
        !requireAuth &&
        !isLoading &&
        isAuthenticated &&
        router.pathname === '/login'
      ) {
        router.replace('/dashboard');
      }
    }, [isAuthenticated, isLoading, requireAuth, router, redirectTo]);

    // Show loading while checking authentication
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

    // If authentication is required and user is not authenticated, don't render
    if (requireAuth && !isAuthenticated) {
      return null;
    }

    // If login page and user is authenticated, don't render (will redirect)
    if (!requireAuth && isAuthenticated && router.pathname === '/login') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // Copy display name for debugging
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithAuthComponent;
}
