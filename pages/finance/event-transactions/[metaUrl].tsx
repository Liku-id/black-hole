import { Box, useTheme, Divider } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2, Card, Body2, Tabs } from '@/components/common';
import { EventTransactionTable } from '@/components/features/finance/transaction/event-table';
import { TransactionSummary } from '@/components/features/finance/transaction/summary';
import WithdrawalHistoryTable from '@/components/features/finance/withdrawal/table';
import { useTransactions } from '@/hooks';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import { useWithdrawalHistory } from '@/hooks/features/withdrawal/useWithdrawalHistory';
import DashboardLayout from '@/layouts/dashboard';
import { TransactionsFilters } from '@/types/transaction';

function EventTransactions() {
  const router = useRouter();
  const theme = useTheme();
  // Using metaUrl from query
  const { metaUrl } = router.query as { metaUrl: string };
  const [activeTab, setActiveTab] = useState('payment');

  // Fetch Event Detail using MetaUrl
  const { eventDetail } = useEventDetail(metaUrl);
  const realEventId = eventDetail?.id;

  // Pagination state for Transactions
  const [filters, setFilters] = useState<TransactionsFilters>({
    eventId: '', // Will be updated when event loads
    page: 0,
    show: 10
  });

  // Pagination state for Withdrawals
  const [withdrawalFilters, setWithdrawalFilters] = useState({
    page: 0,
    show: 10
  });

  // Fetch Transactions
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    pagination: transactionsPagination
  } = useTransactions(filters);

  // Fetch Withdrawals
  const {
    withdrawals,
    loading: withdrawalsLoading,
    pagination: withdrawalsPagination
  } = useWithdrawalHistory(realEventId, undefined, withdrawalFilters);

  // Get event name from first transaction
  const eventName = transactions?.[0]?.event?.name;

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page
    }));
  };

  const handleWithdrawalPageChange = (page: number) => {
    setWithdrawalFilters((prev) => ({
      ...prev,
      page
    }));
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const tabs = [
    { id: 'payment', title: 'Payment' },
    { id: 'withdrawal', title: 'Withdrawal' }
  ];

  // Update filters when event ID is available
  useEffect(() => {
    if (realEventId) {
      setFilters((prev) => ({ ...prev, eventId: realEventId }));
    }
  }, [realEventId]);

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
      <H2 color="text.primary" fontSize="28px" fontWeight={700} mb="16px">
        Event Transactions: {eventDetail?.name ? `: ${eventDetail.name}` : ''}
      </H2>

      {/* Main Card Content */}
      <Card>
        {/* Header: Transaction Details */}
        <Box mb="16px">
          <Body2 color="text.primary" fontSize="16px" fontWeight={600}>
            Transaction Details
          </Body2>
        </Box>

        <Divider sx={{ borderColor: theme.palette.grey[100], mb: '16px' }} />

        {/* Summary Cards */}
        <TransactionSummary eventId={realEventId} />

        {/* Tabs */}
        <Tabs activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange} />

        {/* Tab Panels */}
        {activeTab === 'payment' && (
          <EventTransactionTable
            currentPage={filters.page}
            error={transactionsError}
            loading={transactionsLoading}
            pageSize={filters.show}
            total={transactionsPagination?.totalRecords}
            transactions={transactions}
            onPageChange={handlePageChange}
          />
        )}

        {activeTab === 'withdrawal' && (
          <Box mt="16px">
            <WithdrawalHistoryTable
              currentPage={withdrawalFilters.page}
              loading={withdrawalsLoading}
              pageSize={withdrawalFilters.show}
              total={withdrawalsPagination?.totalRecords || 0}
              withdrawals={withdrawals}
              onPageChange={handleWithdrawalPageChange}
              hideEOName
              hideEventName
            />
          </Box>
        )}
      </Card >
    </DashboardLayout >
  );
}

export default withAuth(EventTransactions, { requireAuth: true });
