import { Box } from '@mui/material';

import { Button, H3, H4 } from '@/components/common';
import { EventDetail } from '@/types/event';
import { EventDetailTicketTable } from './table';

interface EventDetailTicketProps {
  eventDetail: EventDetail;
}

export const EventDetailTicket = ({ eventDetail }: EventDetailTicketProps) => {
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
        <Button variant="primary">Edit Ticket Detail</Button>
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
