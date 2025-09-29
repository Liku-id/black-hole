import { Box, Card, CardContent } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2 } from '@/components/common';
import WithdrawalHistoryTable from '@/components/features/finance/withdrawal/table';
import {
  useEventDetail,
  useEventOrganizerMe,
  useWithdrawalHistory
} from '@/hooks';
import { WithdrawalHistoryItem } from '@/services/withdrawal';
import DashboardLayout from '@/layouts/dashboard';

function WithdrawalHistory() {
  const router = useRouter();
  const { metaUrl } = router.query as { metaUrl: string };

  console.log('WithdrawalHistory page loaded with metaUrl:', metaUrl);

  const { eventDetail } = useEventDetail(metaUrl);
  const { data: eventOrganizer } = useEventOrganizerMe();
  const { withdrawals, loading } = useWithdrawalHistory(
    eventDetail?.id,
    eventOrganizer?.id
  );

  console.log('Event detail:', eventDetail);
  console.log('Withdrawals:', withdrawals);

  const handleViewWithdrawal = (withdrawal: WithdrawalHistoryItem) => {
    // TODO: Implement view withdrawal details
    console.log('View withdrawal:', withdrawal);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Withdrawal History - Black Hole Dashboard</title>
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
          Withdrawal History: {eventDetail?.name || 'Loading...'}
        </H2>
      </Box>

      {/* Withdrawal History Table */}
      <Card>
        <CardContent sx={{ padding: '24px' }}>
          <WithdrawalHistoryTable
            withdrawals={withdrawals}
            loading={loading}
            onView={handleViewWithdrawal}
            hideEventName={true}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(WithdrawalHistory, { requireAuth: true });
