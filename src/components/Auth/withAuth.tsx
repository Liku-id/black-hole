import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

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
    const { isAuthenticated, isLoading, error, user } = useAuth();
    const router = useRouter();
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
      // If authentication is required and user is not authenticated
      if (requireAuth && !isLoading && !isAuthenticated) {
        const currentPath = router.asPath;
        router.replace(
          `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
        );
      }

      // If user is authenticated and trying to access login/register page, redirect to dashboard
      // But only if there's no error and we haven't redirected yet (to prevent redirect when login fails)
      if (
        !requireAuth &&
        !isLoading &&
        isAuthenticated &&
        !error &&
        !hasRedirected &&
        (router.pathname === '/login' || router.pathname === '/register')
      ) {
        setHasRedirected(true);
        router.replace('/dashboard');
        return;
      }

      // Role-based Access Control
      if (!isLoading && isAuthenticated && user && !error && !hasRedirected && requireAuth) {
        // Use type assertion carefully, assume check logic handles structure
        const userWithRole = user as any;
        // Check if user has role property (EventOrganizer might behave differently, usually they are admins/owners)
        // Adjust logic based on exact type structure if needed, but 'role' usually exists on User type
        // For EventOrganizer, checks might be different, but here we target GROUND_STAFF/FINANCE which are typically Users
        const userRole = userWithRole.role?.name;

        if (userRole === 'ground_staff') {
          const path = router.pathname;
          // Allowed: /events (but not create), /tickets, /account
          const isAllowedBase =
            path.startsWith('/events') ||
            path.startsWith('/tickets')
          const isExplicitlyBlocked = path === '/events/create';

          if (!isAllowedBase || isExplicitlyBlocked) {
            setHasRedirected(true);
            router.replace('/events');
            return;
          }
        }

        if (userRole === 'finance') {
          const path = router.pathname;
          // Allowed: /events (but not create), /finance, /account
          const isAllowedBase =
            path.startsWith('/events') ||
            path.startsWith('/finance')
          const isExplicitlyBlocked = path === '/events/create';

          if (!isAllowedBase || isExplicitlyBlocked) {
            setHasRedirected(true);
            router.replace('/events');
            return;
          }
        }
      }

      // Reset redirect flag when error occurs
      if (error && hasRedirected) {
        setHasRedirected(false);
      }
    }, [isAuthenticated, isLoading, requireAuth, router, redirectTo, error, user]);

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

    // If login/register page and user is authenticated, don't render (will redirect)
    if (
      !requireAuth &&
      isAuthenticated &&
      (router.pathname === '/login' || router.pathname === '/register')
    ) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // Copy display name for debugging
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithAuthComponent;
}
