import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { Button, H3, H4, Body2 } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { discountsService, Discount } from '@/services/discounts';
import { ticketsService } from '@/services/tickets';
import { isEventOrganizer, User } from '@/types/auth';
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
  readOnly?: boolean;
  onEditAdditionalForm?: (ticketId: string) => void;
  onVisibilityChange?: () => void;
  onDiscountsChange?: () => void;
}

export const EventDetailTicket = ({
  eventDetail,
  approvalMode = false,
  onApproveTicket,
  onRejectTicket,
  ticketApprovalLoading = false,
  ticketApprovalError = null,
  hideHeader = false,
  showStatus = false,
  readOnly = false,
  onEditAdditionalForm,
  onVisibilityChange,
  onDiscountsChange
}: EventDetailTicketProps) => {
  const router = useRouter();
  const { showError } = useToast();
  const { user } = useAuth();
  const [visibilityLoadingId, setVisibilityLoadingId] = useState<string | null>(null);

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);

  const userRole = user && !isEventOrganizer(user) ? (user as User).role?.name : undefined;
  const sessionRole = user && isEventOrganizer(user) ? 'event_organizer_pic' : userRole;

  const fetchDiscounts = async () => {
    if (!eventDetail?.id) return;
    setDiscountsLoading(true);
    try {
      const res = await discountsService.getDiscountsByEvent(eventDetail.id);
      setDiscounts(res?.body?.discounts || []);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    } finally {
      setDiscountsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [eventDetail?.id]);

  const handleEditTickets = () => {
    router.push(`/events/edit/${eventDetail.metaUrl}/tickets`);
  };

  const handleToggleVisibility = async (ticketId: string, isPublic: boolean) => {
    setVisibilityLoadingId(ticketId);
    try {
      await ticketsService.updateTicketTypeVisibility(ticketId, isPublic);
      onVisibilityChange?.();
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as Error)?.message ||
        'Failed to update ticket visibility';
      showError(errorMessage);
    } finally {
      setVisibilityLoadingId(null);
    }
  };

  const handleToggleGroupVisibility = async (ticketId: string, isPublic: boolean) => {
    setVisibilityLoadingId(ticketId);
    try {
      await ticketsService.updateGroupTicketVisibility(ticketId, isPublic);
      onVisibilityChange?.();
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as Error)?.message ||
        'Failed to update group ticket visibility';
      showError(errorMessage);
    } finally {
      setVisibilityLoadingId(null);
    }
  };

  // Check if there are any pending tickets (regular or group)
  const hasPendingRegularTicket = eventDetail.ticketTypes?.some(
    (tt: any) => !tt.status || tt.status === 'pending'
  );

  const hasPendingGroupTicket = eventDetail.group_tickets?.some(
    (gt: any) => !gt.status || gt.status === 'pending'
  );

  // Hide Edit button if event is on_going or approved AND there are NO pending tickets
  const shouldHideEditTicketButton =
    (eventDetail.eventStatus === 'on_going' ||
      eventDetail.eventStatus === 'approved') &&
    hasPendingRegularTicket;

  const shouldHideEditGroupTicketButton =
    (eventDetail.eventStatus === 'on_going' ||
      eventDetail.eventStatus === 'approved') &&
    hasPendingGroupTicket;

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
              Event Ticket
            </H3>

            {eventDetail.eventStatus !== 'done' &&
              eventDetail.eventStatus !== 'on_review' &&
              !(
                eventDetail.eventStatus === 'on_going' &&
                eventDetail.is_requested
              ) &&
              !shouldHideEditTicketButton &&
              !readOnly && (
                <Button variant="primary" onClick={handleEditTickets}>
                  Edit Ticket
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
        loading={ticketApprovalLoading || discountsLoading}
        error={ticketApprovalError}
        showStatus={showStatus}
        onEditAdditionalForm={onEditAdditionalForm}
        onTogglePublic={!readOnly && !approvalMode ? handleToggleVisibility : undefined}
        visibilityLoadingId={visibilityLoadingId}
        discounts={discounts}
        sessionRole={sessionRole}
        onDiscountsChange={async () => {
          await fetchDiscounts();
          onDiscountsChange?.();
        }}
        eventStatus={eventDetail.eventStatus}
      />

      {/* Group Ticket Section */}
      <Box mt={4}>
        {(!hideHeader || approvalMode) && (
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
            mb={2}
          >
            <H3 color="text.primary" fontWeight={700}>
              Group Ticket
            </H3>

            {!hideHeader &&
              eventDetail.eventStatus !== 'done' &&
              eventDetail.eventStatus !== 'on_review' &&
              !(
                eventDetail.eventStatus === 'on_going' &&
                eventDetail.is_requested
              ) &&
              !shouldHideEditGroupTicketButton &&
              !readOnly && (
                <>
                  {eventDetail.ticketTypes &&
                    eventDetail.ticketTypes.length > 0 ? (
                    <Button
                      variant="primary"
                      onClick={() =>
                        router.push(
                          `/events/edit/${eventDetail.metaUrl}/group-tickets`
                        )
                      }
                    >
                      Edit Group Ticket
                    </Button>
                  ) : (
                    <Box
                      border="1px solid"
                      borderColor="info.main"
                      borderRadius={1}
                      p="8px 12px"
                      sx={{
                        backgroundColor: 'info.light',
                        borderLeft: '4px solid',
                        borderLeftColor: 'info.main'
                      }}
                    >
                      <Body2
                        color="text.primary"
                        fontSize="13px"
                        fontWeight={500}
                      >
                        Please add at least 1 event ticket first
                      </Body2>
                    </Box>
                  )}
                </>
              )}
          </Box>
        )}

        {!hideHeader && (
          <H4 color="text.primary" fontWeight={700} mb="16px">
            Ticket Category
          </H4>
        )}

        <EventDetailTicketTable
          ticketTypes={eventDetail.group_tickets || []}
          approvalMode={approvalMode}
          onApproveTicket={onApproveTicket}
          onRejectTicket={onRejectTicket}
          loading={ticketApprovalLoading}
          error={ticketApprovalError}
          showStatus={showStatus}
          onTogglePublic={!readOnly && !approvalMode ? handleToggleGroupVisibility : undefined}
          visibilityLoadingId={visibilityLoadingId}
        />
      </Box>
    </Box>
  );
};
