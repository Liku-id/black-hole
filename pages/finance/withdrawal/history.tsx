import { Box, Card, CardContent } from '@mui/material';
import { useAtom } from 'jotai';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { selectedEOIdAtom } from '@/atoms/eventOrganizerAtom';
import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2 } from '@/components/common';
import WithdrawalHistoryTable from '@/components/features/finance/withdrawal/table';
import { useEventOrganizerMe } from '@/hooks';
import { useWithdrawalHistory } from '@/hooks/features/withdrawal/useWithdrawalHistory';
import DashboardLayout from '@/layouts/dashboard';

function GeneralWithdrawalHistory() {
  const router = useRouter();
  const [selectedEventOrganizerId] = useAtom(selectedEOIdAtom);
  const [filters, setFilters] = useState({
    page: 0,
    show: 10
  });

  // Fetch the current event organizer data
  const { data: eventOrganizer } = useEventOrganizerMe();

  const eventOrganizerId =
    selectedEventOrganizerId && selectedEventOrganizerId.trim() !== ''
      ? selectedEventOrganizerId
      : eventOrganizer?.id && eventOrganizer.id.trim() !== ''
        ? eventOrganizer.id
        : undefined;

  const { withdrawals, loading, pagination } = useWithdrawalHistory(
    undefined,
    eventOrganizerId,
    filters
  );

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
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
          All Withdrawal History
        </H2>
      </Box>

      {/* Withdrawal History Table */}
      <Card>
        <CardContent sx={{ padding: '24px' }}>
          <WithdrawalHistoryTable
            withdrawals={withdrawals}
            loading={loading}
            hideEOName={eventOrganizer?.id ? true : false}
            total={pagination?.totalRecords || 0}
            currentPage={filters.page}
            pageSize={filters.show}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(GeneralWithdrawalHistory, { requireAuth: true });
