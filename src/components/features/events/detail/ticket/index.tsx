import { Box } from '@mui/material';
import { useRouter } from 'next/router';

import { Button, H3, H4 } from '@/components/common';
import { EventDetail } from '@/types/event';
import { EventDetailTicketTable } from './table';

interface EventDetailTicketProps {
  eventDetail: EventDetail;
}

export const EventDetailTicket = ({ eventDetail }: EventDetailTicketProps) => {
  const router = useRouter();

  const handleEditTickets = () => {
    router.push(`/events/edit/${eventDetail.metaUrl}/tickets`);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <H3 color="text.primary" fontWeight={700}>
          Event Detail Ticket
        </H3>
        {eventDetail.eventStatus !== "done" && eventDetail.eventStatus !== "on_review" && (
          <Button variant="primary" onClick={handleEditTickets}>
            Edit Ticket Detail
          </Button>
        )}
      </Box>

      {/* Ticket Category Label */}
      <H4 color="text.primary" mb="16px" fontWeight={700}>
        Ticket Category
      </H4>

      {/* Ticket Table */}
      <EventDetailTicketTable ticketTypes={eventDetail.ticketTypes || []} />
    </Box>
  );
};
