import { Box, useTheme, Divider } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2, Card, Body2, Tabs } from '@/components/common';
import { EventTransactionTable } from '@/components/features/finance/transaction/event-table';
import { TransactionSummary } from '@/components/features/finance/transaction/summary';
import { useTransactions } from '@/hooks';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import DashboardLayout from '@/layouts/dashboard';
import { TransactionsFilters } from '@/types/transaction';

function EventTransactions() {
  const router = useRouter();
  const theme = useTheme();
  const { eventId } = router.query as { eventId: string };
  const [activeTab, setActiveTab] = useState('payment');

  // Data fetching
  const { eventDetail } = useEventDetail(eventId);

  // Pagination state
  const [filters, setFilters] = useState<TransactionsFilters>({
    eventId,
    page: 0,
    show: 10
  });

  const { transactions, loading, error, pagination } = useTransactions(filters);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
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
        Event Transactions{eventDetail?.name ? `: ${eventDetail.name}` : ''}
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
        <TransactionSummary />

        {/* Tabs */}
        <Tabs activeTab={activeTab} tabs={tabs} onTabChange={handleTabChange} />

        {/* Tab Panels */}
        {activeTab === 'payment' && (
          <EventTransactionTable
            currentPage={filters.page}
            error={error}
            loading={loading}
            pageSize={filters.show}
            total={pagination?.totalItems}
            transactions={transactions}
            onPageChange={handlePageChange}
          />
        )}

        {activeTab === 'withdrawal' && (
          <Box>
            {/* Withdrawal content placeholder */}
          </Box>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(EventTransactions, { requireAuth: true });
