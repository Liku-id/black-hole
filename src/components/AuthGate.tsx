import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGate: React.FC<AuthGateProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/'
}) => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Prevent infinite loops by checking current path
    const currentPath = router.pathname;
    
    if (requireAuth && !isLoggedIn && !isLoading) {
      // Only redirect to login if not already there
      if (currentPath !== '/login') {
        router.replace('/login');
      }
    } else if (!requireAuth && isLoggedIn && !isRedirecting) {
      // Only redirect if not already redirecting and not on target page
      if (currentPath !== redirectTo) {
        setIsRedirecting(true);
        router.replace(redirectTo);
      }
    }
  }, [isLoggedIn, isLoading, requireAuth, redirectTo, isRedirecting]);

  // Show loading or nothing while redirecting
  if (requireAuth && !isLoggedIn) {
    return null;
  }

  if (!requireAuth && isLoggedIn && isRedirecting) {
    return null;
  }

  return <>{children}</>;
}; 