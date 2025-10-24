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

  const handleAdditionalForm = () => {
    router.push(`/events/edit/${eventDetail.metaUrl}/tickets/additional-form`);
  };

  return (
    <Box>
      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        mb={2}
      >
        <H3 color="text.primary" fontWeight={700}>
          Event Detail Ticket
        </H3>

        <Box display="flex" gap={2}>
          {eventDetail.eventStatus !== 'done' &&
            eventDetail.eventStatus !== 'on_review' &&
            eventDetail.eventStatus !== 'on_going' &&
            eventDetail.eventStatus !== 'approved' && (
              <Button variant="secondary" onClick={handleAdditionalForm} disabled={eventDetail.ticketTypes.length === 0}>
                Additional Form
              </Button>
            )}

          {eventDetail.eventStatus !== 'done' &&
            eventDetail.eventStatus !== 'on_review' &&
            eventDetail.eventStatus !== 'on_going' &&
            eventDetail.eventStatus !== 'approved' && (
              <Button variant="primary" onClick={handleEditTickets}>
                Edit Ticket Detail
              </Button>
            )}
        </Box>
      </Box>

      {/* Ticket Category Label */}
      <H4 color="text.primary" fontWeight={700} mb="16px">
        Ticket Category
      </H4>

      {/* Ticket Table */}
      <EventDetailTicketTable ticketTypes={eventDetail.ticketTypes || []} />
    </Box>
  );
};
