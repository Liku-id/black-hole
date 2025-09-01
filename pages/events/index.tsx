import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Tabs, Button, TextField } from '@/components/common';
import EventsTable from '@/components/features/events/list/table';
import { useEvents } from '@/hooks/features/events/useEvents';
import DashboardLayout from '@/layouts/dashboard';
// import EventsFilter from '@/components/EventsFilter';
import { EventsFilters } from '@/types/event';
import { useDebouncedCallback } from '@/utils';

export default function Events() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ongoing');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<EventsFilters>({
    show: 10,
    page: 1,
    name: ''
  });

  const { events, loading, error, mutate } = useEvents(filters);

  const debouncedSetFilters = useDebouncedCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      name: value,
      page: 1
    }));
  }, 1000);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    debouncedSetFilters(value);
  };

  const tabs = [
    { id: 'ongoing', title: 'Ongoing Event', quantity: 0 },
    { id: 'upcoming', title: 'Upcoming Event', quantity: 0 },
    { id: 'draft', title: 'Draft Event', quantity: 0 },
    { id: 'rejected', title: 'Rejected Event', quantity: 0 },
    { id: 'submitted', title: 'On Review Event', quantity: 0 },
    { id: 'done', title: 'Past Event', quantity: 0 }
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
                  onTabChange={setActiveTab}
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
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, mt: 3 }}>
            <Typography gutterBottom variant="subtitle2">
              Failed to load events
            </Typography>
            <Typography variant="body2">{error}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
              Please check your backend connection and try again.
            </Typography>
          </Alert>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && !error && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box py={4} textAlign="center">
                <Typography gutterBottom color="text.secondary" variant="h6">
                  No events found
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  There are no events in the system yet.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
}
