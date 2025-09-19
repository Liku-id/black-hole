import { Box, useTheme } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2, Card, Body2 } from '@/components/common';
import { EventTransactionTable } from '@/components/features/finance/transaction/event-table';
import { useTransactions } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

function EventTransactions() {
  const router = useRouter();
  const theme = useTheme();
  const { eventId } = router.query as { eventId: string };

  const { transactions, loading, error } = useTransactions(eventId);

  return (
    <DashboardLayout>
      <Head>
        <title>Event Transactions - Black Hole Dashboard</title>
      </Head>

      {/* Back Button */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push('/finance')}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Finance
        </Caption>
      </Box>

      {/* Title */}
      <H2 color="text.primary" fontSize="28px" fontWeight={700} mb="32px">
        Event Transactions
      </H2>

      {/* Main Card */}
      <Card>
        <Box
          borderBottom={`1px solid ${theme.palette.grey[100]}`}
          paddingBottom="24px"
        >
          <Body2 color="text.primary" fontSize="16px" fontWeight={600}>
            Transaction Details
          </Body2>
        </Box>
        <EventTransactionTable
          error={error}
          loading={loading}
          transactions={transactions}
        />
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(EventTransactions, { requireAuth: true });
