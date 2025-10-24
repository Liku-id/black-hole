import { Box, Card, CardContent } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2 } from '@/components/common';
import WithdrawalHistoryTable from '@/components/features/finance/withdrawal/table';
import { useEventOrganizerMe } from '@/hooks';
import { useWithdrawalHistory } from '@/hooks/features/withdrawal/useWithdrawalHistory';
import DashboardLayout from '@/layouts/dashboard';

function GeneralWithdrawalHistory() {
  const router = useRouter();
  const { data: eventOrganizer } = useEventOrganizerMe();

  // Get all withdrawals without specific event (pass undefined for eventId)
  const { withdrawals, loading } = useWithdrawalHistory(
    undefined,
    eventOrganizer?.id
  );

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
          All Withdrawal History
        </H2>
      </Box>

      {/* Withdrawal History Table */}
      <Card>
        <CardContent sx={{ padding: '24px' }}>
          <WithdrawalHistoryTable
            withdrawals={withdrawals}
            loading={loading}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(GeneralWithdrawalHistory, { requireAuth: true });
