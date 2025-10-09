import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useAtom } from 'jotai';
import { withAuth } from '@/components/Auth/withAuth';
import DashboardLayout from '@/layouts/dashboard';
import { selectedEOIdAtom } from '@/atoms/eventOrganizerAtom';

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
  const [selectedEventOrganizerId] = useAtom(selectedEOIdAtom);

  return (
    <DashboardLayout>
      <Head>
        <title>Wukong Creator - Dashboard</title>
      </Head>
      <EventStatistic eventOrganizerId={selectedEventOrganizerId} />
      <EventLatest eventOrganizerId={selectedEventOrganizerId} />
      <EventCreation eventOrganizerId={selectedEventOrganizerId} />
    </DashboardLayout>
  );
}

export default withAuth(Dashboard, { requireAuth: true });
