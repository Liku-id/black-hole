import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (requireAuth && !isLoggedIn) {
      router.replace('/login');
    } else if (!requireAuth && isLoggedIn) {
      router.replace(redirectTo);
    }
  }, [isLoggedIn, requireAuth, router, redirectTo]);

  // Show loading or nothing while redirecting
  if (requireAuth && !isLoggedIn) {
    return null;
  }

  if (!requireAuth && isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}; 