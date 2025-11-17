import { Box } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2, Card, Body2 } from '@/components/common';
import EventsTable from '@/components/features/events/list/table';
import { useAuth } from '@/contexts/AuthContext';
import { useEventOrganizerById } from '@/hooks/features/organizers';
import { useEvents } from '@/hooks/features/events/useEvents';
import DashboardLayout from '@/layouts/dashboard';
import { User } from '@/types/auth';
import { EventsFilters } from '@/types/event';

function CreatorEvents() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;

  const eoId = typeof id === 'string' ? id : null;

  // Fetch creator data to get name
  const { data: eventOrganizer } = useEventOrganizerById(eoId, !!eoId);

  // Pagination state
  const [filters, setFilters] = useState<EventsFilters>({
    event_organizer_id: eoId || undefined,
    page: 0,
    show: 10
  });

  const { events, loading, error, mutate, pagination } = useEvents(filters);

  useEffect(() => {
    if (user) {
      const userRole = (user as User).role?.name;
      if (userRole !== 'admin' && userRole !== 'business_development') {
        router.push('/events');
      }
    }
  }, [user, router]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page
    }));
  };

  const creatorName = eventOrganizer?.name || 'Creator';

  return (
    <DashboardLayout>
      <Head>
        <title>Creator Events - Black Hole Dashboard</title>
      </Head>

      {/* Back Button */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push(`/creator`)}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Creator
        </Caption>
      </Box>

      {/* Title */}
      <H2 color="text.primary" fontSize="28px" fontWeight={700} mb="24px">
        Creators: {creatorName}
      </H2>

      {/* Main Card */}
      <Card>
        <EventsTable
          events={events}
          loading={loading}
          onRefresh={mutate}
          total={pagination?.totalRecords || 0}
          currentPage={filters.page || 0}
          pageSize={filters.show || 10}
          onPageChange={handlePageChange}
          showAction={false}
        />

        {/* Error Alert */}
        {error && (
          <Box py={4} textAlign="center">
            <Body2 gutterBottom>Failed to load events</Body2>
            <Body2>{error}</Body2>
            <Caption color="text.secondary" sx={{ mt: 1 }}>
              Please check your backend connection and try again.
            </Caption>
          </Box>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(CreatorEvents, { requireAuth: true });

