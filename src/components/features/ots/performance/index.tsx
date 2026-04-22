import { Box, Divider, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';

import { Body1, Body2, Button, Tabs } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useOTSSummary, useStaff } from '@/hooks';
import { UserRole, isEventOrganizer } from '@/types/auth';

import { OTSSummaryCards } from './summary';
import { PerformanceTable } from './table';

interface OTSPerformanceSectionProps {
  eventId: string;
  userRole?: string;
  userId?: string;
}

export function OTSPerformanceSection({
  eventId,
  userRole,
  userId,
}: OTSPerformanceSectionProps) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // Role detection for fetching staff
  const isEOPIC = user && isEventOrganizer(user);
  const targetEOId = isEOPIC ? user.id : '';
  const { staffList = [] } = useStaff(targetEOId, { page: 0, limit: 100 });
  const hasCashier = staffList.length > 0;

  // New self-contained data fetching (Summary remains at section level)
  const { summary: summaryData, loading: summaryLoading } = useOTSSummary(eventId);

  // Tabs logic for EO
  const cashierTabs = useMemo(() => staffList.map((c) => ({
    id: c.user_id,
    title: c.full_name
  })), [staffList]);

  const [activeTab, setActiveTab] = useState('');

  // Automatically select the first cashier when loaded
  useEffect(() => {
    if (cashierTabs.length > 0 && !activeTab) {
      setActiveTab(cashierTabs[0].id);
    }
  }, [cashierTabs, activeTab]);

  return (
    <Box mt="24px">
      {/* 1. Summary Cards always visible on Performance Tab */}
      <OTSSummaryCards data={summaryData} loading={summaryLoading} />

      {/* 2. Role Specific Content */}
      {userRole === UserRole.CASHIER ? (
        <Box mt="24px" bgcolor="background.paper" p="24px">
          <Body1 color="text.primary" fontWeight={600} mb="16px">Your Transactions</Body1>
          <PerformanceTable
            eventId={eventId}
            cashierId={userId}
          />
        </Box>
      ) : userRole === UserRole.EVENT_ORGANIZER_PIC ? (
        <>
          {hasCashier ? (
            <Box
              bgcolor="common.white"
              border={1}
              borderColor={theme.palette.grey[100]}
              mt="24px"
              p="24px"
            >
              <Body1 color="text.primary" fontWeight={600} pb="16px">
                Cashier Details
              </Body1>
              <Divider sx={{ borderColor: theme.palette.grey[100], mb: '16px' }} />

              <Box alignItems="flex-start" display="flex" justifyContent="space-between">
                <Box flex="1" overflow="hidden">
                  <Tabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={cashierTabs}
                    borderless
                  />
                </Box>
                <Box ml="16px">
                  <Button onClick={() => router.push('/team')}>Add New Cashier</Button>
                </Box>
              </Box>

              <Divider sx={{ borderColor: theme.palette.grey[100] }} />

              {/* Performance Table for Selected Tab */}
              <Box mt="16px">
                <PerformanceTable
                  key={activeTab}
                  eventId={eventId}
                  cashierId={activeTab}
                />
              </Box>
            </Box>
          ) : (
            <Box mt="24px" bgcolor="background.paper" p="24px">
              <Body2 color="text.primary" fontWeight={400}>
                You haven't added a cashier account to your OTS feature. Add a cashier account now?{' '}
                <Box
                  color="primary.main"
                  component="span"
                  fontWeight={400}
                  onClick={() => router.push('/team')}
                  sx={{ cursor: 'pointer' }}
                >
                  Yes, Add Cashier
                </Box>
              </Body2>
            </Box>
          )}
        </>
      ) : null}
    </Box>
  );
}
