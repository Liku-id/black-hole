import { Box, CircularProgress, Typography } from '@mui/material';
import Head from 'next/head';
import { useMemo, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { AttendeeTable, SearchField } from '@/components/features/ticket-list';
import { useEvents, useTickets } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { Ticket } from '@/types/ticket';

// Transform ticket data to match UI expectations
const transformTicketData = (tickets: Ticket[]) => {
  return tickets.map((ticket, index) => ({
    no: index + 1,
    id: ticket.id, // Database ID needed for API calls
    ticketId: ticket.ticket_id || `TKT-${index + 1}`,
    name: ticket.visitor_name || 'Unknown Visitor',
    ticketType: ticket.ticket_name || 'Standard',
    phoneNumber: '-', // Not available in current API response
    date: ticket.created_at
      ? new Date(ticket.created_at).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB'),
    paymentMethod: 'N/A', // Not available in current API response
    redeemStatus: ticket.ticket_status || 'pending'
  }));
};

function Tickets() {
  const [selectedEvent, setSelectedEvent] = useState('');
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

  // Transform tickets for table
  const attendeeData = transformTicketData(tickets);

  const handleScanTicket = () => {
    if (!selectedEvent) {
      // TODO: Show error message - no event selected
      console.log('Please select an event first');
      return;
    }
    // TODO: Implement ticket scanning functionality
    console.log('Scanning ticket for event:', selectedEvent);
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
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: 2
          }}
        >
          <CircularProgress size={40} />
          <Typography color="text.secondary" variant="body1">
            Loading events...
          </Typography>
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
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: 2
          }}
        >
          <Typography color="error" variant="h6">
            Failed to load events
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {eventsError}
          </Typography>
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
            total={apiTotal}
            onPageChange={handlePageChange}
            onRedeemTicket={handleRedeemTicket}
            onSearchChange={handleSearchChange}
          />
        )}

        {/* Show message when no event is selected */}
        {!selectedEvent && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              gap: 2,
              mt: 3
            }}
          >
            <Typography color="text.secondary" variant="h6">
              Select an event to view attendee details
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Choose an event from the dropdown above to see ticket information
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(Tickets, { requireAuth: true });
