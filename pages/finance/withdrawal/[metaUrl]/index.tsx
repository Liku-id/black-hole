import { Box } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2 } from '@/components/common';
import { WithdrawalForm } from '@/components/features/finance/withdrawal/form';
import { useEventDetail, useWithdrawalSummary } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';

function WithdrawalDetail() {
  const router = useRouter();
  const { metaUrl } = router.query as { metaUrl: string };

  const { eventDetail } = useEventDetail(metaUrl);

  const { summary, loading: summaryLoading } = useWithdrawalSummary(
    eventDetail?.id
  );

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
      <Box
        mb={3}
        alignItems="center"
        display="flex"
        justifyContent="space-between"
      >
        <H2 color="text.primary" fontSize="28px" fontWeight={700}>
          Withdrawal Event: {eventDetail?.name || 'Loading...'}
        </H2>
        <Box
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push(`/finance/withdrawal/${metaUrl}/history`)}
        >
          <Image
            alt="withdrawal"
            height={20}
            src="/icon/withdrawal.svg"
            width={20}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box mb={3}>
        <WithdrawalForm
          eventDetail={eventDetail}
          eventId={eventDetail?.id || ''}
          summary={summary}
          summaryLoading={summaryLoading}
        />
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(WithdrawalDetail, { requireAuth: true });
