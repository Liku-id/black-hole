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
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (requireAuth && !isLoggedIn) {
      router.replace('/login');
    } else if (!requireAuth && isLoggedIn) {
      // Add a small delay to allow login page to handle errors
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, requireAuth, router, redirectTo]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [shouldRedirect, router, redirectTo]);

  // Show loading or nothing while redirecting
  if (requireAuth && !isLoggedIn) {
    return null;
  }

  if (!requireAuth && isLoggedIn && shouldRedirect) {
    return null;
  }

  return <>{children}</>;
}; 