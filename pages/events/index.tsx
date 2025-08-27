import Head from 'next/head';
import { useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { Tabs, Button, TextField } from '@/components/common';
import DashboardLayout from '@/layouts/dashboard';
import EventsTable from '@/components/features/events/table';
// import EventsFilter from '@/components/EventsFilter';
import { EventsFilters } from '@/types/event';
import { useEvents } from '@/hooks';
import { useDebouncedCallback } from '@/utils';
import Image from 'next/image';

export default function Events() {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<EventsFilters>({
    show: 10,
    page: 1,
    name: ''
  });

  const { events, loading, error, mutate } = useEvents(filters);

  const debouncedSetFilters = useDebouncedCallback((value: string) => {
    setFilters(prev => ({
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
    { id: 'done', title: 'Past Event', quantity: 0 },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Events - Black Hole Dashboard</title>
      </Head>

      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="24px">
          <Typography fontSize="28px" fontWeight={700} color="text.primary">
            Events
          </Typography>
          <Button>
            Create New Event
          </Button>
        </Box>

        {/* Tabs Card */}
        <Card sx={{ backgroundColor: 'common.white', borderRadius: 0 }}>
          <CardContent sx={{ padding: '16px 24px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box flex="1" marginRight={4}>
                <Tabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </Box>
              
              <TextField
                placeholder="Cari Event"
                value={searchValue}
                onChange={handleSearchChange}
                startComponent={
                  <Image
                    src="/icon/search.svg"
                    alt="Search"
                    width={20}
                    height={20}
                  />
                }
                sx={{ width: 300, flexShrink: 0 }}
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
            <Typography variant="subtitle2" gutterBottom>
              Failed to load events
            </Typography>
            <Typography variant="body2">{error}</Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Please check your backend connection and try again.
            </Typography>
          </Alert>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && !error && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box textAlign="center" py={4}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                >
                  No events found
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
