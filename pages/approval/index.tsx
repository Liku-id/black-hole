import { Box, Card, CardContent, Typography } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Tabs, TextField } from '@/components/common';
import SubmissionsTable from '@/components/features/approval/events/table';
import WithdrawalTable from '@/components/features/approval/withdrawal/table';
import WithdrawalFilter from '@/components/features/approval/withdrawal/table/filter';
import { useAuth } from '@/contexts/AuthContext';
import { useEventsSubmissions } from '@/hooks/features/events-submissions/useEventsSubmissions';
import { useWithdrawals } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { User } from '@/types/auth';
import { EventSubmissionsFilters } from '@/types/events-submission';
import { useDebouncedCallback } from '@/utils';

function Approval() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming_draft');
  const [searchValue, setSearchValue] = useState('');
  const [withdrawalStatus, setWithdrawalStatus] = useState('');
  const [filters, setFilters] = useState<EventSubmissionsFilters>({
    show: 10,
    page: 0,
    type: 'new',
    search: ''
  });

  const { submissions, loading, error, mutate } = useEventsSubmissions(filters);
  const {
    withdrawals,
    loading: withdrawalLoading,
    error: withdrawalError,
    mutate: withdrawalMutate
  } = useWithdrawals({
    status: withdrawalStatus || undefined
  });

  useEffect(() => {
    if (user) {
      const userRole = (user as User).role?.name;
      if (userRole !== 'admin' && userRole !== 'business_development') {
        router.push('/events');
      }
    }
  }, [user, router]);

  const debouncedSetFilters = useDebouncedCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      type: activeTab === 'upcoming_draft' ? 'new' : 'update',
      search: value,
      page: 0
    }));
  }, 1000);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    debouncedSetFilters(value);
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setFilters((prev) => ({
      ...prev,
      type: newTab === 'upcoming_draft' ? 'new' : 'update',
      page: 0
    }));
  };

  const tabs = [
    { id: 'upcoming_draft', title: 'Upcoming Draft' },
    { id: 'current_event', title: 'Current Event' },
    { id: 'withdrawal', title: 'Withdrawal' }
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Approval - Black Hole Dashboard</title>
      </Head>

      <Box>
        {/* Header */}
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          marginBottom="24px"
        >
          <Typography color="text.primary" fontSize="28px" fontWeight={700}>
            Approval
          </Typography>
        </Box>

        {/* Tabs Card */}
        <Card sx={{ backgroundColor: 'common.white', borderRadius: 0 }}>
          <CardContent sx={{ padding: '16px 24px' }}>
            <Box
              alignItems="center"
              display="flex"
              justifyContent="space-between"
              mb={2}
            >
              <Box flex="1" marginRight={4}>
                <Tabs
                  activeTab={activeTab}
                  tabs={tabs}
                  onTabChange={handleTabChange}
                />
              </Box>

              {activeTab === 'withdrawal' ? (
                <WithdrawalFilter
                  status={withdrawalStatus}
                  onStatusChange={setWithdrawalStatus}
                />
              ) : (
                <TextField
                  placeholder="Cari Event"
                  startComponent={
                    <Image
                      alt="Search"
                      height={20}
                      src="/icon/search.svg"
                      width={20}
                    />
                  }
                  sx={{ width: 300, flexShrink: 0 }}
                  value={searchValue}
                  onChange={handleSearchChange}
                />
              )}
            </Box>

            {/* Content based on active tab */}
            {activeTab === 'withdrawal' ? (
              <>
                {/* Withdrawal Table */}
                {(withdrawalLoading || withdrawals.length > 0) && (
                  <WithdrawalTable
                    withdrawals={withdrawals}
                    loading={withdrawalLoading}
                    onRefresh={withdrawalMutate}
                  />
                )}

                {/* Empty State for Withdrawals */}
                {!withdrawalLoading &&
                  withdrawals.length === 0 &&
                  !withdrawalError && (
                    <Box py={4} textAlign="center">
                      <Typography
                        gutterBottom
                        color="text.secondary"
                        variant="h6"
                      >
                        No withdrawals found
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        There are no withdrawal requests to review.
                      </Typography>
                    </Box>
                  )}

                {/* Error Alert for Withdrawals */}
                {withdrawalError && (
                  <Box py={4} textAlign="center">
                    <Typography gutterBottom variant="subtitle2">
                      Failed to load withdrawals
                    </Typography>
                    <Typography variant="body2">{withdrawalError}</Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1 }}
                      variant="caption"
                    >
                      Please check your connection and try again.
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <>
                {/* Submissions Table */}
                {(loading || submissions.length > 0) && (
                  <SubmissionsTable
                    activeTab={activeTab}
                    loading={loading}
                    submissions={submissions as any}
                    onRefresh={mutate}
                  />
                )}

                {/* Empty State */}
                {!loading && submissions.length === 0 && !error && (
                  <Box py={4} textAlign="center">
                    <Typography
                      gutterBottom
                      color="text.secondary"
                      variant="h6"
                    >
                      No submissions found
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      There are no event submissions pending review.
                    </Typography>
                  </Box>
                )}

                {/* Error Alert */}
                {error && (
                  <Box py={4} textAlign="center">
                    <Typography gutterBottom variant="subtitle2">
                      Failed to load submissions
                    </Typography>
                    <Typography variant="body2">{error}</Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 1 }}
                      variant="caption"
                    >
                      Please check your connection and try again.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(Approval, { requireAuth: true });
