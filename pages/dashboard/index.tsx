import { useRouter } from 'next/router';
import { useEffect } from 'react';

function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}

export default DashboardRedirect;
