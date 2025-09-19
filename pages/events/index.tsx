import { Box, Card, CardContent, Typography } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Tabs, Button, TextField } from '@/components/common';
import EventsTable from '@/components/features/events/list/table';
import { useEvents } from '@/hooks/features/events/useEvents';
import DashboardLayout from '@/layouts/dashboard';
import { EventsFilters } from '@/types/event';
import { useDebouncedCallback } from '@/utils';

function Events() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('EVENT_STATUS_ON_GOING');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<EventsFilters>({
    show: 10,
    page: 1,
    status: 'EVENT_STATUS_ON_GOING',
    name: ''
  });

  const { events, eventCountByStatus, loading, error, mutate } =
    useEvents(filters);

  const debouncedSetFilters = useDebouncedCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: activeTab,
      name: value,
      page: 1
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
      page: 1
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
      id: 'EVENT_STATUS_DRAFT',
      title: 'Draft',
      quantity: eventCountByStatus && eventCountByStatus.draft
    },
    {
      id: 'EVENT_STATUS_REJECTED',
      title: 'Rejected',
      quantity: eventCountByStatus && eventCountByStatus.rejected
    },
    {
      id: 'EVENT_STATUS_ON_REVIEW',
      title: 'On Review',
      quantity: eventCountByStatus && eventCountByStatus.onReview
    },
    {
      id: 'EVENT_STATUS_DONE',
      title: 'Past',
      quantity: eventCountByStatus && eventCountByStatus.done
    }
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Events - Black Hole Dashboard</title>
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
            Events
          </Typography>
          <Button onClick={() => router.push('/events/create')}>
            Create New Event
          </Button>
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
            </Box>

            {/* Events Table */}
            {(loading || events.length > 0) && (
              <EventsTable
                events={events}
                loading={loading}
                onRefresh={mutate}
              />
            )}

            {/* Empty State */}
            {!loading && events.length === 0 && !error && (
              <Box py={4} textAlign="center">
                <Typography gutterBottom color="text.secondary" variant="h6">
                  No events found
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  There are no events in the system yet.
                </Typography>
              </Box>
            )}

            {/* Error Alert */}
            {error && (
              <Box py={4} textAlign="center">
                <Typography gutterBottom variant="subtitle2">
                  Failed to load events
                </Typography>
                <Typography variant="body2">{error}</Typography>
                <Typography
                  color="text.secondary"
                  sx={{ mt: 1 }}
                  variant="caption"
                >
                  Please check your backend connection and try again.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(Events, { requireAuth: true });
