import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';

function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/events');
  }, [router]);

  return null;
}

// Export with authentication wrapper that requires authentication
export default withAuth(Home, { requireAuth: true });
