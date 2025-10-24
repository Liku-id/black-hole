import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/events');
      } else {
        router.replace('/register');
      }
    }
  }, [router, isAuthenticated, isLoading]);

  return null;
}

export default Home;
