import { Box, Divider } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { Body2, Caption, Select, Button } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks';
import { withdrawalService } from '@/services';
import { WithdrawalSummary } from '@/services/withdrawal';
import { Event } from '@/types/event';
import { formatUtils } from '@/utils/formatUtils';

const FinanceWithdrawal = () => {
  const router = useRouter();
  const { user } = useAuth();
  console.log(user);
  const [selectedProject, setSelectedProject] = useState<Event | null>(null);

  const { events, loading } = useEvents({
    status: ['EVENT_STATUS_ON_GOING', 'EVENT_STATUS_DONE']
  });

  // State untuk withdrawal summary
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchSummary = async () => {
    if (!selectedProject) {
      setSummary(null);
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);

    try {
      const response = await withdrawalService.getSummaryByEventId(
        selectedProject.id
      );
      setSummary(response.body);
    } catch (err) {
      console.error('Failed to fetch withdrawal summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const projectOptions = events.map((event) => ({
    value: event,
    label: event.name
  }));

  const handleProjectChange = (value: Event) => {
    setSelectedProject(value);
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedProject]);

  const handleWithdrawalClick = () => {
    if (selectedProject) {
      router.push(`/finance/withdrawal/${selectedProject.metaUrl}`);
    }
  };

  return (
    <Box
      bgcolor="background.paper"
      borderRadius={0}
      display="flex"
      flexDirection="column"
      padding="16px"
    >
      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        marginBottom="8px"
      >
        <Body2>Withdrawal</Body2>
        <Image
          alt="withdrawal"
          height={20}
          src="/icon/withdrawal.svg"
          width={20}
        />
      </Box>

      {/* Select Project */}
      <Box marginBottom="16px">
        <Select
          fullWidth
          disabled={loading}
          label=""
          options={projectOptions}
          placeholder={loading ? 'Loading events...' : 'Choose Project'}
          value={selectedProject || null}
          onChange={handleProjectChange}
        />
      </Box>

      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        marginBottom="8px"
      >
        <Caption color="text.secondary">Total Revenue</Caption>
        <Caption color="primary.main">
          {summaryLoading
            ? 'Loading...'
            : summary
              ? formatUtils.formatPrice(parseFloat(summary.totalAmount))
              : 'Rp 0'}
        </Caption>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0', marginBottom: '12px' }} />

      {/* Balance on Hold */}
      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        marginBottom="8px"
      >
        <Caption color="text.secondary">Balance on Hold</Caption>
        <Caption color="primary.main">
          {summaryLoading
            ? 'Loading...'
            : summary
              ? formatUtils.formatPrice(
                  parseFloat(summary.pendingSettlementAmount)
                )
              : 'Rp 0'}
        </Caption>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0', marginBottom: '12px' }} />

      {/* Available for Withdrawal */}
      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        marginBottom="8px"
      >
        <Caption color="text.secondary">Available for Withdrawal</Caption>
        <Caption color="primary.main">
          {summaryLoading
            ? 'Loading...'
            : summary
              ? formatUtils.formatPrice(parseFloat(summary.availableAmount))
              : 'Rp 0'}
        </Caption>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0', marginBottom: '12px' }} />

      {/* Withdrawal Button */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          disabled={
            !selectedProject ||
            summaryLoading ||
            !summary ||
            parseFloat(summary.availableAmount) <= 0
          }
          variant="primary"
          onClick={handleWithdrawalClick}
        >
          Withdrawal
        </Button>
      </Box>
    </Box>
  );
};

export default FinanceWithdrawal;
