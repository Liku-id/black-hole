import { Box, Divider } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Body2, Button, Caption, AutoComplete } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks';
import { withdrawalService } from '@/services';
import { WithdrawalSummary } from '@/services/withdrawal';
import { Event } from '@/types/event';
import { formatUtils } from '@/utils/formatUtils';
import { useDebouncedCallback } from '@/utils/debounceUtils';

interface FinanceWithdrawalProps {
  onEventOrganizerSelect?: (eventOrganizerId: string) => void;
}

const FinanceWithdrawal = ({ onEventOrganizerSelect }: FinanceWithdrawalProps) => {
  const router = useRouter();
  const {} = useAuth();
  const [selectedProject, setSelectedProject] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const { events, loading } = useEvents({
    status: ['EVENT_STATUS_ON_GOING', 'EVENT_STATUS_DONE'],
    ...(searchQuery.trim() && { name: searchQuery })
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
    id: event.id,
    value: event.id,
    label: event.name
  }));

  // Debounced search handler
  const debouncedSearch = useDebouncedCallback((query: string) => {
    setSearchQuery(query.trim());
    setIsSearching(true);
  }, 1000);

  const handleInputChange = (_: any, newInputValue: string, reason: string) => {
    setInputValue(newInputValue);

    if (reason === 'input') {
      if (newInputValue.trim()) {
        debouncedSearch(newInputValue);
        setIsDropdownOpen(true);
      } else {
        setSearchQuery('');
        setIsSearching(false);
        setIsDropdownOpen(false);
      }
    }
  };

  const handleChange = (_: any, newValue: any, reason: string) => {
    if (reason === 'selectOption') {
      if (newValue) {
        const selectedEvent = events.find((event) => event.id === newValue.id);
        setSelectedProject(selectedEvent || null);
        setSearchQuery('');
        setInputValue(newValue.label);
        setIsSearching(false);
        setIsDropdownOpen(false); // Close dropdown after selection
        
        // Send event organizer ID to parent component
        if (onEventOrganizerSelect && selectedEvent?.eventOrganizerId) {
          onEventOrganizerSelect(selectedEvent.eventOrganizerId);
        }
      } else {
        setSelectedProject(null);
      }
    } else if (reason === 'clear') {
      setSearchQuery('');
      setSelectedProject(null);
      setInputValue('');
      setIsSearching(false);
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedProject]);

  // Initialize inputValue when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      setInputValue(selectedProject.name);
    }
  }, [selectedProject]);

  // Reset isSearching when loading completes
  useEffect(() => {
    if (!loading && isSearching) {
      setIsSearching(false);
    }
  }, [loading, isSearching]);

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
        <AutoComplete
          disabled={loading}
          label=""
          options={projectOptions}
          placeholder={
            loading ? 'Loading events...' : 'Search and choose project...'
          }
          value={
            selectedProject
              ? projectOptions.find(
                  (option) => option.id === selectedProject.id
                ) || null
              : null
          }
          inputValue={inputValue}
          onChange={handleChange}
          onInputChange={handleInputChange}
          loading={isSearching || loading}
          loadingText="Searching events..."
          noOptionsText={
            searchQuery
              ? `No events found for "${searchQuery}"`
              : 'No events available'
          }
          open={isDropdownOpen}
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
