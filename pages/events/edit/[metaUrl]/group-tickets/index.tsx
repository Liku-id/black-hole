import { Box } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Button, Card, Body1, Caption, H2 } from '@/components/common';
import { GroupTicketCreateModal } from '@/components/features/events/edit/group-tickets/modal';
import { GroupTicketTable } from '@/components/features/events/edit/group-tickets/table';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import DashboardLayout from '@/layouts/dashboard';
import { ticketsService } from '@/services';
import { GroupTicket } from '@/types/event';
import { dateUtils } from '@/utils';


interface GroupTicketCategory {
  id: string;
  ticketTypeId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  bundleQuantity: number;
  maxOrderQuantity: number;
  salesStartDate: string;
  salesEndDate: string;
  status?: string;
  rejectedReason?: string;
  salesStartRawDate?: string;
  salesStartTime?: string;
  salesStartTimeZone?: string;
  salesEndRawDate?: string;
  salesEndTime?: string;
  salesEndTimeZone?: string;
}

const EditGroupTicketsPage = () => {
  const router = useRouter();
  const { metaUrl } = router.query;
  const { eventDetail, mutate: mutateEventDetail } = useEventDetail(
    metaUrl as string
  );
  const [groupTickets, setGroupTickets] = useState<GroupTicketCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<
    GroupTicketCategory | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editedTicketIds, setEditedTicketIds] = useState<Set<string>>(new Set());

  // Initialize group tickets from eventDetail
  useEffect(() => {
    if (eventDetail?.group_tickets && !isInitialized) {
      const initialTickets: GroupTicketCategory[] = eventDetail.group_tickets.map(
        (ticket: GroupTicket) => ({
          id: ticket.id,
          ticketTypeId: ticket.ticket_type_id,
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          quantity: ticket.quantity,
          bundleQuantity: ticket.bundle_quantity,
          maxOrderQuantity: ticket.max_order_quantity,
          salesStartDate: ticket.sales_start_date,
          salesEndDate: ticket.sales_end_date,
          status: ticket.status,
          rejectedReason: ticket.rejected_reason
        })
      );
      setGroupTickets(initialTickets);
      setEditedTicketIds(new Set());
      setIsInitialized(true);
    }
  }, [eventDetail, isInitialized]);

  // Redirect if event is on review or done
  useEffect(() => {
    if (!router.isReady) return;
    if (
      eventDetail?.eventStatus === 'on_review' ||
      eventDetail?.eventStatus === 'done'
    ) {
      router.replace('/events');
    }
  }, [router.isReady, eventDetail]);

  // Prevent hydration error
  if (!router.isReady) {
    return null;
  }

  const handleAddTicket = () => {
    setEditingTicket(undefined);
    setModalOpen(true);
  };

  const handleCreateTicket = async (data: any) => {
    if (editingTicket) {
      // Update existing ticket
      const updatedTickets = groupTickets.map((ticket) => {
        if (ticket.id !== editingTicket.id) return ticket;

        const nextSalesStartISO =
          data.salesStartRawDate &&
          data.salesStartTime &&
          data.salesStartTimeZone
            ? dateUtils.formatDateISO({
                date: data.salesStartRawDate,
                time: data.salesStartTime,
                timeZone: data.salesStartTimeZone
              })
            : ticket.salesStartDate;

        const nextSalesEndISO =
          data.salesEndRawDate && data.salesEndTime && data.salesEndTimeZone
            ? dateUtils.formatDateISO({
                date: data.salesEndRawDate,
                time: data.salesEndTime,
                timeZone: data.salesEndTimeZone
              })
            : ticket.salesEndDate;

        return {
          ...ticket,
          ticketTypeId: data.ticketTypeId,
          name: data.name,
          description: data.description,
          price: parseInt(data.price),
          quantity: parseInt(data.quantity),
          bundleQuantity: parseInt(data.bundleQuantity),
          maxOrderQuantity: parseInt(data.maxOrderQuantity),
          salesStartDate: nextSalesStartISO,
          salesEndDate: nextSalesEndISO,
          salesStartRawDate: data.salesStartRawDate,
          salesStartTime: data.salesStartTime,
          salesStartTimeZone: data.salesStartTimeZone,
          salesEndRawDate: data.salesEndRawDate,
          salesEndTime: data.salesEndTime,
          salesEndTimeZone: data.salesEndTimeZone,
          status: data.status,
          rejectedReason: data.rejectedReason
        };
      });
      setGroupTickets(updatedTickets);
      setEditedTicketIds((prev) => new Set(prev).add(editingTicket.id));
      setEditingTicket(undefined);
    } else {
      // Create new ticket
      const newTicket: GroupTicketCategory = {
        id: Date.now().toString(),
        ticketTypeId: data.ticketTypeId,
        name: data.name,
        description: data.description,
        price: parseInt(data.price),
        quantity: parseInt(data.quantity),
        bundleQuantity: parseInt(data.bundleQuantity),
        maxOrderQuantity: parseInt(data.maxOrderQuantity),
        salesStartDate: data.salesStartDate,
        salesEndDate: data.salesEndDate,
        salesStartRawDate: data.salesStartRawDate,
        salesStartTime: data.salesStartTime,
        salesStartTimeZone: data.salesStartTimeZone,
        salesEndRawDate: data.salesEndRawDate,
        salesEndTime: data.salesEndTime,
        salesEndTimeZone: data.salesEndTimeZone
      };

      setGroupTickets([...groupTickets, newTicket]);
    }
  };

  const handleEditTicket = (ticket: GroupTicketCategory) => {
    const formattedTicket = {
      ...ticket,
      salesStartDate: dateUtils.formatDateTimeWIB(ticket.salesStartDate),
      salesEndDate: dateUtils.formatDateTimeWIB(ticket.salesEndDate),
      originalSalesStartDate: ticket.salesStartDate,
      originalSalesEndDate: ticket.salesEndDate
    };
    setEditingTicket(formattedTicket);
    setModalOpen(true);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setGroupTickets(groupTickets.filter((ticket) => ticket.id !== ticketId));
  };

  const handleSubmitEvent = async () => {
    if (!metaUrl || !eventDetail) {
      alert('Required data not found');
      return;
    }

    setIsLoading(true);

    try {
      const originalTickets = eventDetail.group_tickets || [];
      const originalTicketIds = originalTickets.map((t: GroupTicket) => t.id);
      const currentTicketIds = groupTickets.map((t) => t.id);

      // Find deleted tickets
      const deletedTicketIds = originalTicketIds.filter(
        (id) => !currentTicketIds.includes(id)
      );
      // Find new tickets
      const newTickets = groupTickets.filter(
        (t) => !originalTicketIds.includes(t.id)
      );
      // Find updated tickets
      const updatedTickets = groupTickets.filter((t) =>
        originalTicketIds.includes(t.id) && editedTicketIds.has(t.id)
      );

      // Step 1: Delete removed tickets
      for (const ticketId of deletedTicketIds) {
        await ticketsService.deleteGroupTicket(ticketId);
      }

      // Step 2: Update existing tickets
      for (const ticket of updatedTickets) {
        const salesStartISO =
          ticket.salesStartRawDate &&
          ticket.salesStartTime &&
          ticket.salesStartTimeZone
            ? dateUtils.formatDateISO({
                date: ticket.salesStartRawDate,
                time: ticket.salesStartTime,
                timeZone: ticket.salesStartTimeZone
              })
            : dateUtils.toIso(ticket.salesStartDate);
        const salesEndISO =
          ticket.salesEndRawDate &&
          ticket.salesEndTime &&
          ticket.salesEndTimeZone
            ? dateUtils.formatDateISO({
                date: ticket.salesEndRawDate,
                time: ticket.salesEndTime,
                timeZone: ticket.salesEndTimeZone
              })
            : dateUtils.toIso(ticket.salesEndDate);

        const updatePayload = {
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          quantity: ticket.quantity,
          bundleQuantity: ticket.bundleQuantity,
          maxOrderQuantity: ticket.maxOrderQuantity,
          salesStartDate: salesStartISO,
          salesEndDate: salesEndISO
        };
        await ticketsService.updateGroupTicket(ticket.id, updatePayload);
      }

      // Step 3: Create new tickets
      for (const ticket of newTickets) {
        const salesStartISO = dateUtils.formatDateISO({
          date: ticket.salesStartRawDate,
          time: ticket.salesStartTime,
          timeZone: ticket.salesStartTimeZone
        });
        const salesEndISO = dateUtils.formatDateISO({
          date: ticket.salesEndRawDate,
          time: ticket.salesEndTime,
          timeZone: ticket.salesEndTimeZone
        });

        const payload = {
          ticketTypeId: ticket.ticketTypeId,
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          quantity: ticket.quantity,
          bundleQuantity: ticket.bundleQuantity,
          maxOrderQuantity: ticket.maxOrderQuantity,
          salesStartDate: salesStartISO,
          salesEndDate: salesEndISO
        };
        await ticketsService.createGroupTicket(payload);
      }

      await mutateEventDetail();
      setEditedTicketIds(new Set());
      router.push(`/events/${metaUrl}?tab=tickets`);
    } catch (error: any) {
      console.error('Failed to update group tickets:', error);
      alert('Failed to update group tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/events/${metaUrl}?tab=tickets`);
  };

  const isEventApprovedOrOngoing =
    eventDetail?.eventStatus === 'approved' ||
    eventDetail?.eventStatus === 'on_going';
  const allTicketsApproved = groupTickets.every((t) => t.status === 'approved');
  const isUpdateDisabled =
    isLoading || (isEventApprovedOrOngoing && allTicketsApproved);

  return (
    <DashboardLayout>
      <Box>
        {/* Back Button */}
        <Box
          alignItems="center"
          display="flex"
          gap={1}
          mb={2}
          sx={{ cursor: 'pointer' }}
          onClick={() => router.back()}
        >
          <Image alt="Back" height={24} src="/icon/back.svg" width={24} />
          <Caption color="text.secondary" component="span">
            Back To Event Detail
          </Caption>
        </Box>

        {/* Title */}
        <H2 color="text.primary" fontWeight={700} mb="21px">
          Edit Group Ticket
        </H2>

        {/* Card with Ticket Category */}
        <Card>
          {/* Card Title */}
          <Body1 color="text.primary" fontWeight={600} marginBottom="24px">
            Ticket Category
          </Body1>

          {/* Table */}
          <Box marginBottom="24px">
            <GroupTicketTable
              groupTickets={groupTickets}
              eventStatus={eventDetail?.eventStatus}
              ticketTypes={eventDetail?.ticketTypes || []}
              onDelete={handleDeleteTicket}
              onEdit={handleEditTicket}
            />
          </Box>

          {/* Add New Ticket Button */}
          <Box display="flex" justifyContent="flex-end" marginBottom="24px">
            <Button variant="secondary" onClick={handleAddTicket}>
              + add new group ticket
            </Button>
          </Box>

          {/* Footer Buttons */}
          <Box
            display="flex"
            gap="24px"
            justifyContent="flex-end"
            marginBottom="24px"
          >
            <Button
              disabled={isLoading}
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              disabled={isUpdateDisabled}
              variant="primary"
              onClick={handleSubmitEvent}
            >
              Save
            </Button>
          </Box>
        </Card>
      </Box>

      {/* Modal */}
      <GroupTicketCreateModal
        editingTicket={editingTicket}
        open={modalOpen}
        ticketTypes={eventDetail?.ticketTypes || []}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTicket}
        eventStatus={eventDetail?.eventStatus}
      />
    </DashboardLayout>
  );
};

export default withAuth(EditGroupTicketsPage, { requireAuth: true });
