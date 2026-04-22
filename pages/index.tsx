import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        const userWithRole = user as any;
        const userRole = userWithRole?.role?.name;

        if (userRole === 'cashier') {
          router.replace('/ots');
        } else if (userRole === 'ground_staff' || userRole === 'finance') {
          router.replace('/events');
        } else {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/register');
      }
    }
  }, [router, isAuthenticated, isLoading, user]);

  return null;
}

export default Home;
