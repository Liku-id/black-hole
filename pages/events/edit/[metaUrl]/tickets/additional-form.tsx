import { Box } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Card, Caption, H2 } from '@/components/common';
import { AdditionalForm } from '@/components/features/events/edit/tickets/additional-form';
import { useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

function AdditionalFormPage() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');

  const { eventDetail, loading: eventLoading, error: eventError } = useEventDetail(metaUrl as string);

  const handleBack = () => {
    router.push(`/events/${metaUrl}`);
  };

  const handleTicketTypeChange = (value: string) => {
    setSelectedTicketType(value);
  };

  const selectedTicket = eventDetail?.ticketTypes?.find(ticket => ticket.id === selectedTicketType);

  if (eventLoading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading - Black Hole Dashboard</title>
        </Head>
        <Box>Loading...</Box>
      </DashboardLayout>
    );
  }

  if (eventError || !eventDetail) {
    return (
      <DashboardLayout>
        <Head>
          <title>Event Not Found - Black Hole Dashboard</title>
        </Head>
        <Box>Failed to load event: {eventError}</Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Additional Form - {eventDetail.name} - Black Hole Dashboard</title>
      </Head>

      {/* Back Button */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={handleBack}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back to Ticket Category
        </Caption>
      </Box>

      {/* Title */}
      <H2 color="text.primary" fontWeight={700} mb="21px">
        Additional Form{selectedTicket ? `: ${selectedTicket.name}` : ''}
      </H2>

      {/* Additional Form Card */}
      <Card sx={{ py: 1 }}>
        <AdditionalForm
          ticketTypes={eventDetail?.ticketTypes || []}
          selectedTicketType={selectedTicketType}
          onTicketTypeChange={handleTicketTypeChange}
        />
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(AdditionalFormPage, { requireAuth: true });
