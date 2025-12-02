import { Box, useTheme } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Caption, H2, Card, TextField, Body1 } from '@/components/common';
import { PartnerTransactionTable } from '@/components/features/events/partner-ticket/transaction-table';
import { useTransactions } from '@/hooks';
import { TransactionsFilters } from '@/types/transaction';
import DashboardLayout from '@/layouts/dashboard';
import { useEventDetail } from '@/hooks';
import { usePartnerTicketTypes } from '@/hooks';
import { useDebouncedCallback } from '@/utils/debounceUtils';

function PartnerTransactions() {
  const router = useRouter();
  const theme = useTheme();
  const { metaUrl, partnerId } = router.query as {
    metaUrl: string;
    partnerId: string;
  };

  const {
    eventDetail,
    loading: eventLoading,
    error: eventError
  } = useEventDetail(metaUrl as string);

  // Get partner ticket types to find partner name
  const eventId = eventDetail?.id;
  const {
    partnerTicketTypes: partnerTicketTypesData,
    loading: partnerTicketTypesLoading
  } = usePartnerTicketTypes(
    eventId
      ? {
          event_id: eventId,
          page: 0,
          limit: 100 // Get all to find the partner
        }
      : null
  );

  // Find partner name from partner ticket types
  const partner = partnerTicketTypesData.find(
    (ptt) => ptt.partner?.id === partnerId
  );

  const partnerName = partner?.partner?.partner_name || 'Unknown Partner';

  // Pagination and search state
  const [filters, setFilters] = useState<TransactionsFilters>({
    eventId: eventId as string,
    partnerId: partnerId as string,
    page: 0,
    show: 10
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Update filters when eventId is available
  useEffect(() => {
    if (eventId) {
      setFilters((prev) => ({
        ...prev,
        eventId: eventId as string
      }));
    }
  }, [eventId]);

  const { transactions, loading, error, pagination } = useTransactions(filters);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page
    }));
  };

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 0 // Reset to first page when searching
    }));
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  if (eventLoading || partnerTicketTypesLoading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Partner Transactions - Black Hole Dashboard</title>
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
        <title>
          Partner Transactions - {partnerName} - Black Hole Dashboard
        </title>
      </Head>

      {/* Back Button */}
      <Box
        alignItems="center"
        display="flex"
        gap={1}
        mb={2}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push(`/events/${metaUrl}/partner-ticket`)}
      >
        <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
        <Caption color="text.secondary" component="span">
          Back To Event
        </Caption>
      </Box>

      {/* Title */}
      <H2 color="text.primary" fontSize="28px" fontWeight={700} mb="32px">
        Partner Name: {partnerName}
      </H2>

      {/* Main Card */}
      <Card>
        <Box
          borderBottom={`1px solid ${theme.palette.grey[100]}`}
          paddingBottom="16px"
          paddingX="16px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Body1 color="text.primary" fontSize="16px" fontWeight={600}>
            Transaction Details
          </Body1>
          <TextField
            placeholder="Name/Ticket ID"
            value={searchQuery}
            onChange={handleSearchChange}
            startComponent={
              <Image
                alt="Search"
                height={16}
                src="/icon/search.svg"
                width={16}
              />
            }
            sx={{
              width: '300px',
              '& .MuiOutlinedInput-root': {
                height: '40px'
              }
            }}
          />
        </Box>
        <Box paddingX="24px" paddingY="24px">
          <PartnerTransactionTable
            error={error}
            loading={loading}
            transactions={transactions}
            total={pagination?.totalItems}
            currentPage={filters.page}
            pageSize={filters.show}
            onPageChange={handlePageChange}
          />
        </Box>
      </Card>
    </DashboardLayout>
  );
}

export default withAuth(PartnerTransactions, { requireAuth: true });
