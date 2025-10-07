import Head from 'next/head';
import dynamic from 'next/dynamic';
import { withAuth } from '@/components/Auth/withAuth';
import DashboardLayout from '@/layouts/dashboard';

const EventStatistic = dynamic(
  () => import('@/components/features/dashboard/event-stat')
);
const EventLatest = dynamic(
  () => import('@/components/features/dashboard/event-latest')
);
const EventCreation = dynamic(
  () => import('@/components/features/dashboard/event-creation')
);

function Dashboard() {
  return (
    <DashboardLayout>
      <Head>
        <title>Wukong Creator - Dashboard</title>
      </Head>
      <EventStatistic />
      <EventLatest />
      <EventCreation />
    </DashboardLayout>
  );
}

export default withAuth(Dashboard, { requireAuth: true });
