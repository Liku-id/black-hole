import { Box } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useMemo, useEffect } from 'react';

import {
  Tabs,
  Button,
  TextField,
  Body1,
  Body2,
  Caption,
  H3
} from '@/components/common';
import EventsTable from '@/components/features/events/list/table';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/features/events/useEvents';
import { EventsFilters } from '@/types/event';
import { isEventOrganizer } from '@/types/auth';
import { useDebouncedCallback } from '@/utils';

interface EventCreationProps {
  eventOrganizerId?: string;
}

const EventCreation = ({ eventOrganizerId }: EventCreationProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('EVENT_STATUS_ON_GOING');
  const [searchValue, setSearchValue] = useState('');

  const [filters, setFilters] = useState<EventsFilters>({
    show: 10,
    page: 0,
    status: 'EVENT_STATUS_ON_GOING',
    name: '',
    ...(eventOrganizerId && { event_organizer_id: eventOrganizerId })
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      event_organizer_id: eventOrganizerId || undefined
    }));
  }, [eventOrganizerId]);

  const { events, eventCountByStatus, loading, error, mutate, pagination } =
    useEvents(filters);
  const { user } = useAuth();

  const isOrganizerDataComplete = useMemo(() => {
    if (eventOrganizerId) return true;
    if (!isEventOrganizer(user)) return false;

    if (!user.organizer_type) return false;

    if (user.organizer_type === 'individual') {
      const requiredFields = [
        'ktp_photo_id',
        'npwp_photo_id',
        'nik',
        'npwp',
        'ktp_address',
        'pic_name'
      ];
      return requiredFields.every((field) => {
        const value = user[field as keyof typeof user];
        return value && value.toString().trim() !== '';
      });
    } else if (user.organizer_type === 'institutional') {
      const requiredFields = [
        'npwp_photo_id',
        'npwp',
        'npwp_address',
        'full_name'
      ];
      return requiredFields.every((field) => {
        const value = user[field as keyof typeof user];
        return value && value.toString().trim() !== '';
      });
    }

    return false;
  }, [user, eventOrganizerId]);

  const debouncedSetFilters = useDebouncedCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: activeTab,
      name: value,
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
      status: newTab,
      page: 0
    }));
  };

  const handlePageChange = (val: number) => {
    setFilters((prev) => ({
      ...prev,
      page: val
    }));
  };

  const tabs = [
    {
      id: 'EVENT_STATUS_ON_GOING',
      title: 'Ongoing',
      quantity: eventCountByStatus && eventCountByStatus.onGoing
    },
    {
      id: 'EVENT_STATUS_APPROVED',
      title: 'Upcoming',
      quantity: eventCountByStatus && eventCountByStatus.approved
    },
    {
      id: 'EVENT_STATUS_DONE',
      title: 'Past',
      quantity: eventCountByStatus && eventCountByStatus.done
    }
  ];

  return (
    <Box
      bgcolor="background.paper"
      boxShadow="0 4px 20px 0 rgba(40, 72, 107, 0.05)"
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={2.5}
        sx={{ borderBottom: '1px solid', borderColor: 'grey.100' }}
      >
        <H3 color="text.primary" fontWeight={700}>
          Events
        </H3>
        <Button
          id="create_new_event_button"
          onClick={() => router.push('/events/create')}
          disabled={!isOrganizerDataComplete}
        >
          Create New Event
        </Button>
      </Box>

      {/* Tabs + Controls */}
      <Box bgcolor="background.paper">
        <Box px={3} py={2}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box flex={1} mr={4}>
              <Tabs
                activeTab={activeTab}
                tabs={tabs}
                onTabChange={handleTabChange}
              />
            </Box>

            <Box width={300} flexShrink={0}>
              <TextField
                fullWidth
                placeholder="Cari Event"
                startComponent={
                  <Image
                    alt="Search"
                    height={20}
                    src="/icon/search.svg"
                    width={20}
                  />
                }
                value={searchValue}
                onChange={handleSearchChange}
              />
            </Box>
          </Box>

          {/* Events Table */}
          {(loading || events.length > 0) && (
            <EventsTable
              events={events}
              loading={loading}
              onRefresh={mutate}
              total={pagination?.totalRecords || 0}
              currentPage={filters.page}
              onPageChange={handlePageChange}
              isCompact
            />
          )}

          {/* Empty State */}
          {!loading && events.length === 0 && !error && (
            <Box py={4} textAlign="center">
              <Image
                alt="no-data"
                src="/icon/incomplete.svg"
                height={48}
                width={48}
              />
              <Body1 gutterBottom color="primary.dark" fontWeight={700}>
                No Events Reviewed Yet
              </Body1>

              <Box display="flex" justifyContent="center">
                <Body2 color="text.secondary">
                  What are you waiting for? You can create <br /> exciting
                  events whenever and wherever you like.
                </Body2>
              </Box>

              <Box mt={2}>
                <Button
                  id="create_new_event_empty_button"
                  onClick={() => router.push('/events/create')}
                  disabled={!isOrganizerDataComplete}
                >
                  Create New Event
                </Button>
              </Box>
            </Box>
          )}

          {/* Error Alert */}
          {error && (
            <Box py={4} textAlign="center">
              <Body2 gutterBottom>Failed to load events</Body2>
              <Body2>{error}</Body2>
              <Caption color="text.secondary" sx={{ mt: 1 }}>
                Please check your backend connection and try again.
              </Caption>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EventCreation;
