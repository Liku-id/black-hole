import { Box, Card, CardContent } from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';

import { withAuth } from '@/components/Auth/withAuth';
import {
  Tabs,
  Button,
  TextField,
  H2,
  Body1,
  Body2,
  Caption
} from '@/components/common';
import EventsTable from '@/components/features/events/list/table';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/features/events/useEvents';
import DashboardLayout from '@/layouts/dashboard';
import { EventsFilters } from '@/types/event';
import { isEventOrganizer } from '@/types/auth';
import { useDebouncedCallback } from '@/utils';
import { selectedEOIdAtom } from '@/atoms/eventOrganizerAtom';

function Events() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  // Initialize state
  const [selectedEventOrganizerId] = useAtom(selectedEOIdAtom);
  const [activeTab, setActiveTab] = useState(status || 'EVENT_STATUS_ON_GOING');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<EventsFilters>({
    show: 10,
    page: 0,
    status: status || 'EVENT_STATUS_ON_GOING',
    name: '',
    // Only add event_organizer_id if it's not empty
    ...(selectedEventOrganizerId && {
      event_organizer_id: selectedEventOrganizerId
    })
  });

  const { events, eventCountByStatus, loading, error, mutate, total } =
    useEvents(filters);

  const { user } = useAuth();

  // Computed value to check if organizer data is complete - reactive to user changes
  const isOrganizerDataComplete = useMemo(() => {
    if (selectedEventOrganizerId) return true;

    if (!isEventOrganizer(user)) return false;

    // Check if organizer_type is empty or null
    if (!user.organizer_type) return false;

    if (user.organizer_type === 'individual') {
      // Check required fields for individual organizer
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
      // Check required fields for institutional organizer
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
  }, [user, selectedEventOrganizerId]);

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

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage
    }));
  };

  useEffect(() => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        page: 0
      };

      if (selectedEventOrganizerId) {
        newFilters.event_organizer_id = selectedEventOrganizerId;
      } else {
        delete newFilters.event_organizer_id;
      }

      return newFilters;
    });
  }, [selectedEventOrganizerId]);

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
          <H2 color="text.primary" fontWeight={700}>
            Events
          </H2>
          <Button
            onClick={() => router.push('/events/create')}
            disabled={!isOrganizerDataComplete}
          >
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
                total={total}
                currentPage={filters.page}
                onPageChange={handlePageChange}
              />
            )}

            {/* Empty State */}
            {!loading && events.length === 0 && !error && (
              <Box py={4} textAlign="center">
                <Body1 gutterBottom color="text.secondary">
                  No events found
                </Body1>
                <Body2
                  color={
                    isOrganizerDataComplete ? 'text.secondary' : 'text.primary'
                  }
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  {!isOrganizerDataComplete ? (
                    <>
                      Please complete your registration data in the
                      <Box
                        onClick={() => router.push('/account')}
                        sx={{
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          color: 'primary.main',
                          paddingX: 0.75
                        }}
                      >
                        Account menu
                      </Box>
                      to create events.
                    </>
                  ) : (
                    'There are no events in the system yet.'
                  )}
                </Body2>
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
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(Events, { requireAuth: true });
