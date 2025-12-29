import { Box, CircularProgress } from '@mui/material';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { withAuth } from '@/components/Auth/withAuth';
import { Body1, Body2, H3 } from '@/components/common';
import { AttendeeTable, SearchField } from '@/components/features/ticket-list';
import { useEvents, useTickets, useEventDetail } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { Ticket, AttendeeAdditionalData, TicketStatus } from '@/types/ticket';

// Transform ticket data to match UI expectations
const transformTicketData = (tickets: Ticket[]) => {
  return tickets.map((ticket, index) => ({
    no: index + 1,
    id: ticket.id, // Database ID needed for API calls
    ticketId: ticket.ticket_id || `-`,
    name: ticket.visitor_name || '-',
    ticketType: ticket.ticket_name || '-',
    phoneNumber: ticket.phone_number || '-',
    date: ticket.created_at || new Date().toISOString(),
    paymentMethod: ticket.payment_method_name || 'N/A',
    redeemStatus: ticket.ticket_status || 'pending',
    email: ticket.email,
    eventDate: ticket.issued_at || undefined,
    transactionId: ticket.transaction_id,
    transactionNumber: ticket.transaction_number,
    redeemedAt: ticket.redeemed_at,
    checkedInAt: ticket.checked_in_at,
    attendeeData: (ticket.attendee_data || []) as AttendeeAdditionalData[]
  }));
};

function Tickets() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  const [filters, setFilters] = useState<{
    eventId: string;
    page: number;
    show: number;
    search: string;
    ticketTypeIds?: string;
    ticketStatus?: TicketStatus;
  }>({
    eventId: eventId,
    page: 0,
    show: 10,
    search: '',
    ticketTypeIds: undefined,
    ticketStatus: undefined
  });

  // Get events list for dropdown
  const {
    events,
    loading: eventsLoading,
    error: eventsError
  } = useEvents({ show: 100, page: 0 });

  // Get tickets data when event is selected
  const {
    tickets,
    loading: ticketsLoading,
    mutate: mutateTickets,
    pagination
  } = useTickets(filters);

  // Transform events for dropdown options
  const eventOptions = events.map((event) => ({
    value: event.id,
    label: event.name
  }));

  // Get selected event data for detailed information
  const selectedEventData = useMemo(() => {
    if (!filters.eventId) return null;
    return events.find((event) => event.id === filters.eventId) || null;
  }, [filters.eventId, events]);

  // Get event detail to fetch ticket types
  const { eventDetail } = useEventDetail(selectedEventData?.metaUrl || '');

  // Get ticket types from event detail
  const ticketTypeOptions = useMemo(() => {
    if (!eventDetail?.ticketTypes) return [];
    return eventDetail.ticketTypes.map((type) => ({
      value: type.id,
      label: type.name
    }));
  }, [eventDetail]);

  // Transform tickets for table
  const attendeeData = transformTicketData(tickets);

  const handleScanTicket = () => {
    const scanTicketUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://wukong.co.id/ticket/auth'
        : 'https://staging-aws.wukong.co.id/ticket/auth';

    window.open(scanTicketUrl, '_blank');
  };

  const handleEventChange = (value: string) => {
    setFilters((prev) => ({ ...prev, eventId: value, page: 0 }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 0 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleTicketTypeChange = (ticketTypeIds: string) => {
    setFilters((prev) => ({ 
      ...prev, 
      ticketTypeIds: ticketTypeIds === '' ? undefined : ticketTypeIds, 
      page: 0 
    }));
  };
  
  const handleTicketStatusChange = (ticketStatus: TicketStatus | '') => {
    setFilters((prev) => ({ 
      ...prev, 
      ticketStatus: ticketStatus !== '' ? ticketStatus : undefined, 
      page: 0 
    }));
  };

  const handleRedeemTicket = (_ticketId: string) => {
    mutateTickets();
  };

  // Show loading spinner for initial page load
  if (eventsLoading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Tickets - Black Hole Dashboard</title>
        </Head>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          gap={2}
          justifyContent="center"
          sx={{
            minHeight: '400px'
          }}
        >
          <CircularProgress size={40} />
          <Body1 color="text.secondary">Loading events...</Body1>
        </Box>
      </DashboardLayout>
    );
  }

  // Show error if events failed to load
  if (eventsError) {
    return (
      <DashboardLayout>
        <Head>
          <title>Tickets - Black Hole Dashboard</title>
        </Head>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          gap={2}
          justifyContent="center"
          sx={{
            minHeight: '400px'
          }}
        >
          <H3 color="error">Failed to load events</H3>
          <Body2 color="text.secondary">{eventsError}</Body2>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Tickets - Black Hole Dashboard</title>
      </Head>

      <Box>
        {/* Event Search Section */}
        <SearchField
          eventOptions={eventOptions}
          selectedEvent={filters.eventId || ''}
          onEventChange={handleEventChange}
          onScanTicket={handleScanTicket}
        />

        {/* Attendee Details Section - only show when event is selected */}
        {filters.eventId && (
          <AttendeeTable
            attendeeData={attendeeData}
            currentPage={filters.page}
            loading={ticketsLoading}
            pageSize={10}
            searchQuery={filters.search}
            selectedEventData={selectedEventData}
            total={pagination?.totalRecords}
            ticketTypeOptions={ticketTypeOptions}
            selectedTicketTypeIds={filters.ticketTypeIds}
            selectedTicketStatus={filters.ticketStatus}
            onPageChange={handlePageChange}
            onRedeemTicket={handleRedeemTicket}
            onSearchChange={handleSearchChange}
            onTicketTypeChange={handleTicketTypeChange}
            onTicketStatusChange={handleTicketStatusChange}
          />
        )}

        {/* Show message when no event is selected */}
        {!filters.eventId && (
          <Box
            alignItems="center"
            display="flex"
            flexDirection="column"
            gap={2}
            justifyContent="center"
            sx={{
              minHeight: '300px',
              mt: 3
            }}
          >
            <H3 color="text.secondary">
              Select an event to view attendee details
            </H3>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(Tickets, { requireAuth: true });
