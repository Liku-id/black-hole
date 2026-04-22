import { Box, Divider, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { Body1, Button, Tabs } from '@/components/common';
import { Staff } from '@/types/staff';

import { PerformanceTable } from '../table';

interface CashierDetailsProps {
  eventId: string;
  cashiers: Staff[];
}

export function CashierDetails({ eventId, cashiers }: CashierDetailsProps) {
  const theme = useTheme();
  const router = useRouter();

  const cashierTabs = cashiers.map((c) => ({
    id: c.user_id,
    title: c.full_name
  }));

  const [activeTab, setActiveTab] = useState('');

  // Automatically select the first child when loaded or mutated
  useEffect(() => {
    if (cashierTabs.length > 0 && !activeTab) {
      setActiveTab(cashierTabs[0].id);
    }
  }, [cashierTabs, activeTab]);

  return (
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

      <Box
        alignItems="flex-start"
        display="flex"
        justifyContent="space-between"
      >
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

      {/* Divider below Tabs */}
      <Divider sx={{ borderColor: theme.palette.grey[100] }} />

      {/* Performance Table */}
      {activeTab && <PerformanceTable eventId={eventId} cashierId={activeTab} />}
    </Box>
  );
}
