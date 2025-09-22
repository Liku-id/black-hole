import { Box } from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { AttendeeTable, SearchField } from '@/components/features/ticket-list';
import DashboardLayout from '@/layouts/dashboard';

function Tickets() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock events data - replace with actual API call
  const eventOptions = [
    { value: 'event1', label: 'Conference 2024' },
    { value: 'event2', label: 'Music Festival Summer' },
    { value: 'event3', label: 'Tech Meetup January' },
    { value: 'event4', label: 'Art Exhibition 2024' }
  ];

  // Mock attendee data - replace with actual API call
  const attendeeData = [
    {
      no: 1,
      ticketId: '8912322',
      name: 'Mahabul Munir',
      ticketType: 'VVIP',
      phoneNumber: '+62 81328623934',
      date: '06/12/2026',
      paymentMethod: 'QRIS',
      redeemStatus: 'Redeemed' as const
    },
    {
      no: 2,
      ticketId: '8912323',
      name: 'Vincent Bonku',
      ticketType: 'Regular',
      phoneNumber: '+62 81328623934',
      date: '06/12/2026',
      paymentMethod: 'VA Mandiri',
      redeemStatus: 'Redeemed' as const
    },
    {
      no: 3,
      ticketId: '8912324',
      name: 'Edgar Bero',
      ticketType: 'Regular',
      phoneNumber: '+62 81328623934',
      date: '06/12/2026',
      paymentMethod: 'VA BCA',
      redeemStatus: 'Unredeemed' as const
    },
    {
      no: 4,
      ticketId: '8912325',
      name: 'Nabila Kharisma',
      ticketType: 'Regular',
      phoneNumber: '+62 81328623934',
      date: '06/12/2026',
      paymentMethod: 'VA BRI',
      redeemStatus: 'Redeemed' as const
    },
    {
      no: 5,
      ticketId: '8912326',
      name: 'M salfuloh Noor',
      ticketType: 'Regular',
      phoneNumber: '+62 81328623934',
      date: '06/12/2026',
      paymentMethod: 'VA BRI',
      redeemStatus: 'Unredeemed' as const
    }
  ];

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
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleRedeemTicket = (ticketId: string) => {
    console.log('Redeem ticket:', ticketId);
    // TODO: Implement redeem functionality
  };

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

        {/* Attendee Details Section */}
        <AttendeeTable
          attendeeData={attendeeData}
          searchQuery={searchQuery}
          onRedeemTicket={handleRedeemTicket}
          onSearchChange={handleSearchChange}
        />
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(Tickets, { requireAuth: true });
