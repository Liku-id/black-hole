import { Box } from '@mui/material';
import { useRouter } from 'next/router';

import { Button, H3, H4 } from '@/components/common';
import { EventDetail } from '@/types/event';

import { EventDetailTicketTable } from './table';

interface EventDetailTicketProps {
  eventDetail: EventDetail;
  approvalMode?: boolean;
  onApproveTicket?: (ticketId: string) => void;
  onRejectTicket?: (ticketId: string, rejectedFields: string[]) => void;
  ticketApprovalLoading?: boolean;
  ticketApprovalError?: string | null;
  hideHeader?: boolean;
  showStatus?: boolean;
}

export const EventDetailTicket = ({ 
  eventDetail,
  approvalMode = false,
  onApproveTicket,
  onRejectTicket,
  ticketApprovalLoading = false,
  ticketApprovalError = null,
  hideHeader = false,
  showStatus = false
}: EventDetailTicketProps) => {
  const router = useRouter();

  const handleEditTickets = () => {
    router.push(`/events/edit/${eventDetail.metaUrl}/tickets`);
  };

  return (
    <Box>
      {!hideHeader && (
        <>
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
            mb={2}
          >
            <H3 color="text.primary" fontWeight={700}>
              Event Tickets
            </H3>

            {eventDetail.eventStatus !== 'done' &&
              eventDetail.eventStatus !== 'on_review' && (
                <Button variant="primary" onClick={handleEditTickets}>
                  Edit Ticket Detail
                </Button>
              )}
          </Box>

          {/* Ticket Category Label */}
          <H4 color="text.primary" fontWeight={700} mb="16px">
            Ticket Category
          </H4>
        </>
      )}

      {/* Ticket Table */}
      <EventDetailTicketTable 
        ticketTypes={eventDetail.ticketTypes || []} 
        approvalMode={approvalMode}
        onApproveTicket={onApproveTicket}
        onRejectTicket={onRejectTicket}
        loading={ticketApprovalLoading}
        error={ticketApprovalError}
        showStatus={showStatus}
      />
    </Box>
  );
};
