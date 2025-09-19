import { Box } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2 } from '@/components/common';
import { WithdrawalForm } from '@/components/features/finance/withdrawal/withdrawal-form';
import { useEvents } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

function WithdrawalDetail() {
  const router = useRouter();
  const { eventId } = router.query as { eventId: string };

  const { events } = useEvents({
    status: ['EVENT_STATUS_ON_GOING', 'EVENT_STATUS_DONE']
  });

  const selectedEvent = events.find((event) => event.id === eventId);

  return (
    <DashboardLayout>
      <Head>
        <title>Withdrawal - Black Hole Dashboard</title>
      </Head>

      {/* Back Button */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={1.5}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push('/finance')}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Finance
        </Caption>
      </Box>

      {/* Title */}
      <Box mb={3}>
        <H2 color="text.primary" fontSize="28px" fontWeight={700}>
          Withdrawal Event: {selectedEvent?.name || 'Loading...'}
        </H2>
      </Box>

      {/* Main Content */}
      <Box mb={3}>
        <WithdrawalForm eventId={eventId} />
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(WithdrawalDetail, { requireAuth: true });
