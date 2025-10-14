import { Box, CircularProgress } from '@mui/material';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { withAuth } from '@/components/Auth/withAuth';
import { Body1, Body2, H3 } from '@/components/common';
import { AttendeeTable, SearchField } from '@/components/features/ticket-list';
import { useEvents, useTickets } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { Ticket } from '@/types/ticket';

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
    transactionNumber: ticket.transaction_number
  }));
};

function Tickets() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  const [selectedEvent, setSelectedEvent] = useState(eventId);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Get events list for dropdown
  const { events, loading: eventsLoading, error: eventsError } = useEvents();

  // Create stable filters object to prevent unnecessary re-renders
  const ticketFilters = useMemo(() => {
    if (!selectedEvent) return null;

    return {
      eventId: selectedEvent,
      page: currentPage,
      show: 10,
      search: searchQuery
    };
  }, [selectedEvent, currentPage, searchQuery]);

  // Get tickets data when event is selected
  const {
    tickets,
    total: apiTotal,
    currentPage: apiCurrentPage,
    currentShow: apiCurrentShow,
    loading: ticketsLoading,
    mutate: mutateTickets
  } = useTickets(ticketFilters);

  // Transform events for dropdown options
  const eventOptions = events.map((event) => ({
    value: event.id,
    label: event.name
  }));

  // Get selected event data for detailed information
  const selectedEventData = useMemo(() => {
    if (!selectedEvent) return null;
    return events.find((event) => event.id === selectedEvent) || null;
  }, [selectedEvent, events]);

  // Transform tickets for table
  const attendeeData = transformTicketData(tickets);

  const handleScanTicket = () => {
    // Open scan ticket page in new tab - use different URLs based on environment
    const scanTicketUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://wukong.co.id/ticket/auth'
        : 'https://staging-aws.wukong.co.id/ticket/auth';

    window.open(scanTicketUrl, '_blank');
  };

  const handleEventChange = (value: string) => {
    setSelectedEvent(value);
    setCurrentPage(0); // Reset to first page when event changes
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRedeemTicket = (_ticketId: string) => {
    // The actual redeem API call is handled in the AttendeeTable component
    // This function is called after successful redeem to refresh the data
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
          selectedEvent={selectedEvent}
          onEventChange={handleEventChange}
          onScanTicket={handleScanTicket}
        />

        {/* Attendee Details Section - only show when event is selected */}
        {selectedEvent && (
          <AttendeeTable
            attendeeData={attendeeData}
            currentPage={apiCurrentPage}
            loading={ticketsLoading}
            pageSize={apiCurrentShow}
            searchQuery={searchQuery}
            selectedEventData={selectedEventData}
            total={apiTotal}
            onPageChange={handlePageChange}
            onRedeemTicket={handleRedeemTicket}
            onSearchChange={handleSearchChange}
          />
        )}

        {/* Show message when no event is selected */}
        {!selectedEvent && (
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
