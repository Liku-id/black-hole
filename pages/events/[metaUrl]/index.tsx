import { Box, Divider, styled } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Card, Caption, H2, H3, Overline } from '@/components/common';
import { EventDetailAssets } from '@/components/features/events/detail/assets';
import { EventDetailInfo } from '@/components/features/events/detail/info';
import { EventDetailTicket } from '@/components/features/events/detail/ticket';
import { useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

const StyledDivider = styled(Divider)({
  margin: '24px 0px',
  borderColor: 'grey.100',
  borderWidth: '1px'
});

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case 'on_going':
        return {
          backgroundColor: 'success.light',
          color: 'success.main',
          displayName: 'Ongoing'
        };
      case 'approved':
        return {
          backgroundColor: 'info.light',
          color: 'info.main',
          displayName: 'Upcoming'
        };
      case 'rejected':
        return {
          backgroundColor: 'warning.light',
          color: 'warning.main',
          displayName: 'Rejected'
        };
      case 'on_review':
        return {
          backgroundColor: 'error.light',
          color: 'error.main',
          displayName: 'On Review'
        };
      default:
        return {
          backgroundColor: 'info.dark',
          color: 'info.contrastText',
          displayName: 'Draft'
        };
    }
  };

  const statusConfig = getStatusStyle(status);

  return (
    <Box
      component="span"
      padding="3px 7px"
      borderRadius="10px"
      bgcolor={statusConfig.backgroundColor}
      color={statusConfig.color}
    >
      <Overline>{statusConfig.displayName}</Overline>
    </Box>
  );
};

function EventDetail() {
  const router = useRouter();
  const { metaUrl } = router.query;

  const { eventDetail, loading, error } = useEventDetail(metaUrl as string);

  // Status validation - redirect non-draft events
  useEffect(() => {
    if (eventDetail && eventDetail.eventStatus !== 'draft') {
      //   router.replace(`/events`);
    }
  }, [eventDetail, metaUrl, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Event - Black Hole Dashboard</title>
        </Head>
        <Box>Loading...</Box>
      </DashboardLayout>
    );
  }

  if (error || !eventDetail) {
    return (
      <DashboardLayout>
        <Head>
          <title>Event Not Found - Black Hole Dashboard</title>
        </Head>
        <Box>Failed to load event: {error}</Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>{eventDetail.name} - Black Hole Dashboard</title>
      </Head>

      {/* Back Button */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        mb={2}
        onClick={() => router.push(`/events`)}
        sx={{ cursor: 'pointer' }}
      >
        <Image src="/icon/back.svg" alt="Back" width={24} height={24} />
        <Caption color="text.secondary" component="span">
          Back To Event List
        </Caption>
      </Box>

      {/* Title */}
      <H2 color="text.primary" mb="21px" fontWeight={700}>
        Event Detail
      </H2>

      {/* Event Name */}
      <Box display="flex" alignItems="center" gap={2} mb="16px">
        <H3 color="text.primary" fontWeight={700}>
          Event Name: {eventDetail.name}
        </H3>
        <StatusBadge status={eventDetail.eventStatus} />
      </Box>

      {/* Main Card */}
      <Card sx={{ mb: 3 }}>
        <EventDetailInfo eventDetail={eventDetail} />
        <StyledDivider />
        <EventDetailAssets eventDetail={eventDetail} />
        <StyledDivider />
        <EventDetailTicket eventDetail={eventDetail} />
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(EventDetail, { requireAuth: true });
