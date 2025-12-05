import { Box } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Button, Card, Body1, Caption, H2 } from '@/components/common';
import { TicketCreateModal } from '@/components/features/events/create/ticket/create-modal';
import TicketTable from '@/components/features/events/create/ticket/table';
import TicketAdditionalFormModal from '@/components/features/events/edit/tickets/modal';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import DashboardLayout from '@/layouts/dashboard';
import { ticketsService } from '@/services';
import { dateUtils } from '@/utils';

interface TicketCategory {
  id: string;
  name: string;
  description: string;
  colorHex: string;
  price: number;
  quantity: number;
  maxPerUser: number;
  salesStartDate: string;
  salesEndDate: string;
  ticketStartDate: string;
  ticketEndDate: string;
  salesStartRawDate?: string;
  salesStartTime?: string;
  salesStartTimeZone?: string;
  salesEndRawDate?: string;
  salesEndTime?: string;
  salesEndTimeZone?: string;
  ticketStartRawDate?: string;
  ticketEndRawDate?: string;
}

const EditTicketsPage = () => {
  const router = useRouter();
  const { metaUrl } = router.query;
  const { eventDetail, mutate: mutateEventDetail } = useEventDetail(
    metaUrl as string
  );
  const [tickets, setTickets] = useState<TicketCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<
    TicketCategory | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showAdditionalFormModal, setShowAdditionalFormModal] = useState(false);

  // Initialize tickets from eventDetail
  useEffect(() => {
    if (eventDetail?.ticketTypes && !isInitialized) {
      const initialTickets: TicketCategory[] = eventDetail.ticketTypes.map(
        (ticket) => ({
          id: ticket.id,
          name: ticket.name,
          description: ticket.description,
          colorHex: ticket.color_hex.startsWith('#')
            ? ticket.color_hex.substring(1)
            : ticket.color_hex,
          price: ticket.price,
          quantity: ticket.quantity,
          maxPerUser: ticket.max_order_quantity,
          salesStartDate: ticket.sales_start_date,
          salesEndDate: ticket.sales_end_date,
          ticketStartDate: ticket.ticketStartDate,
          ticketEndDate: ticket.ticketEndDate
        })
      );
      setTickets(initialTickets);
      setIsInitialized(true);
    }
  }, [eventDetail, isInitialized]);

  // Ensure hooks are not called conditionally; redirect when ready
  useEffect(() => {
    if (!router.isReady) return;
    if (
      eventDetail?.eventStatus === 'on_review' ||
      eventDetail?.eventStatus === 'on_going' ||
      eventDetail?.eventStatus === 'done'
    ) {
      router.replace('/events');
    }
  }, [router.isReady, eventDetail]);

  // Prevent hydration error by checking if router is ready
  if (!router.isReady) {
    return null;
  }

  const handleAddTicket = () => {
    setEditingTicket(undefined);
    setModalOpen(true);
  };

  const handleCreateTicket = async (data: any) => {
    if (editingTicket) {
      // Update existing ticket - persist scalars and recompute ISO dates if raw parts provided
      const updatedTickets = tickets.map((ticket) => {
        if (ticket.id !== editingTicket.id) return ticket;

        // Compute new ISO values only when raw parts are provided
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

        const nextTicketStartISO = data.ticketStartRawDate
          ? dateUtils.formatDateISO({
              date: data.ticketStartRawDate,
              timeZone: '+07:00'
            })
          : ticket.ticketStartDate;

        const nextTicketEndISO = data.ticketEndRawDate
          ? dateUtils.formatDateISO({
              date: data.ticketEndRawDate,
              timeZone: '+07:00'
            })
          : ticket.ticketEndDate;

        return {
          ...ticket,
          name: data.name,
          description: data.description,
          colorHex: data.colorHex,
          price: parseInt(data.price),
          quantity: parseInt(data.quantity),
          maxPerUser: parseInt(data.maxPerUser),
          // store ISO so UI reflects the change immediately
          salesStartDate: nextSalesStartISO,
          salesEndDate: nextSalesEndISO,
          ticketStartDate: nextTicketStartISO,
          ticketEndDate: nextTicketEndISO,
          // update raw parts from modal (used on submit)
          salesStartRawDate: data.salesStartRawDate,
          salesStartTime: data.salesStartTime,
          salesStartTimeZone: data.salesStartTimeZone,
          salesEndRawDate: data.salesEndRawDate,
          salesEndTime: data.salesEndTime,
          salesEndTimeZone: data.salesEndTimeZone,
          ticketStartRawDate: data.ticketStartRawDate,
          ticketEndRawDate: data.ticketEndRawDate
        };
      });
      setTickets(updatedTickets);
      setEditingTicket(undefined);
    } else {
      // Create new ticket
      const newTicket: TicketCategory = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        colorHex: data.colorHex,
        price: parseInt(data.price),
        quantity: parseInt(data.quantity),
        maxPerUser: parseInt(data.maxPerUser),
        salesStartDate: data.salesStartDate,
        salesEndDate: data.salesEndDate,
        ticketStartDate: data.ticketStartDate,
        ticketEndDate: data.ticketEndDate,
        // Store raw data for ISO conversion
        salesStartRawDate: data.salesStartRawDate,
        salesStartTime: data.salesStartTime,
        salesStartTimeZone: data.salesStartTimeZone,
        salesEndRawDate: data.salesEndRawDate,
        salesEndTime: data.salesEndTime,
        salesEndTimeZone: data.salesEndTimeZone,
        ticketStartRawDate: data.ticketStartRawDate,
        ticketEndRawDate: data.ticketEndRawDate
      };

      setTickets([...tickets, newTicket]);
    }
  };

  const handleEditTicket = (ticket: TicketCategory) => {
    // Format the ticket data for the modal to display properly
    const formattedTicket = {
      ...ticket,
      salesStartDate: dateUtils.formatDateTimeWIB(ticket.salesStartDate),
      salesEndDate: dateUtils.formatDateTimeWIB(ticket.salesEndDate),
      ticketStartDate: dateUtils.formatDateDDMMYYYY(ticket.ticketStartDate),
      ticketEndDate: dateUtils.formatDateDDMMYYYY(ticket.ticketEndDate)
    };
    setEditingTicket(formattedTicket);
    setModalOpen(true);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
  };

  const handleSubmitEvent = async () => {
    if (!metaUrl || !eventDetail) {
      alert('Required data not found');
      return;
    }

    setIsLoading(true);

    try {
      // Calculate changes based on original vs current tickets
      const originalTickets = eventDetail.ticketTypes || [];
      const originalTicketIds = originalTickets.map((t) => t.id);
      const currentTicketIds = tickets.map((t) => t.id);

      // Find deleted tickets
      const deletedTicketIds = originalTicketIds.filter(
        (id) => !currentTicketIds.includes(id)
      );
      // Find new tickets (with generated ID from Date.now())
      const newTickets = tickets.filter(
        (t) => !originalTicketIds.includes(t.id)
      );
      // Find updated tickets
      const updatedTickets = tickets.filter((t) =>
        originalTicketIds.includes(t.id)
      );

      // Step 1: Delete removed tickets
      for (const ticketId of deletedTicketIds) {
        await ticketsService.deleteTicketType(ticketId);
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
        const ticketStartISO = ticket.ticketStartRawDate
          ? dateUtils.formatDateISO({
              date: ticket.ticketStartRawDate,
              timeZone: '+07:00'
            })
          : dateUtils.toIso(ticket.ticketStartDate);
        const ticketEndISO = ticket.ticketEndRawDate
          ? dateUtils.formatDateISO({
              date: ticket.ticketEndRawDate,
              timeZone: '+07:00'
            })
          : dateUtils.toIso(ticket.ticketEndDate);

        const updatePayload = {
          name: ticket.name,
          quantity: ticket.quantity,
          description: ticket.description,
          price: ticket.price,
          eventId: eventDetail.id,
          maxOrderQuantity: ticket.maxPerUser,
          colorHex: ticket.colorHex,
          salesStartDate: salesStartISO,
          salesEndDate: salesEndISO,
          isPublic: true,
          ticketStartDate: ticketStartISO,
          ticketEndDate: ticketEndISO
        };
        await ticketsService.updateTicketType(ticket.id, updatePayload);
      }

      // Step 3: Create new tickets (POST per ticket)
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
        const ticketStartISO = dateUtils.formatDateISO({
          date: ticket.ticketStartRawDate,
          timeZone: '+07:00'
        });
        const ticketEndISO = dateUtils.formatDateISO({
          date: ticket.ticketEndRawDate,
          timeZone: '+07:00'
        });

        const payload = {
          name: ticket.name,
          quantity: ticket.quantity,
          description: ticket.description,
          price: ticket.price,
          eventId: eventDetail.id,
          maxOrderQuantity: ticket.maxPerUser,
          colorHex: ticket.colorHex,
          salesStartDate: salesStartISO,
          salesEndDate: salesEndISO,
          isPublic: true,
          ticketStartDate: ticketStartISO,
          ticketEndDate: ticketEndISO
        };
        const createdTicket = await ticketsService.createTicketType(payload);
        // Create default additional form for new ticket
        if (createdTicket?.body?.id) {
          await ticketsService.createAdditionalForm({
            ticketTypeId: createdTicket.body.id,
            field: 'Visitor Name',
            type: 'TEXT',
            isRequired: true
          });
        }
      }
      await mutateEventDetail();
      setShowAdditionalFormModal(true);
    } catch (error: any) {
      console.error('Failed to update event tickets:', error);
      alert('Failed to update tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/events/${metaUrl}`);
  };

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
          Edit Ticket
        </H2>

        {/* Card with Ticket Category */}
        <Card>
          {/* Card Title */}
          <Body1 color="text.primary" fontWeight={600} marginBottom="24px">
            Ticket Category
          </Body1>

          {/* Table */}
          <Box marginBottom="24px">
            <TicketTable
              tickets={tickets}
              onDelete={handleDeleteTicket}
              onEdit={handleEditTicket}
            />
          </Box>

          {/* Add New Ticket Button */}
          <Box display="flex" justifyContent="flex-end" marginBottom="24px">
            <Button variant="secondary" onClick={handleAddTicket}>
              + add new ticket category
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
              disabled={isLoading}
              variant="primary"
              onClick={handleSubmitEvent}
            >
              Update Tickets
            </Button>
          </Box>
        </Card>
      </Box>

      {/* Modal */}
      <TicketCreateModal
        editingTicket={editingTicket}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      {/* Additional Form Modal */}
      <TicketAdditionalFormModal
        open={showAdditionalFormModal}
        onClose={() => {
          mutateEventDetail();
          setIsInitialized(false);
          setShowAdditionalFormModal(false);
        }}
      />
    </DashboardLayout>
  );
};

export default withAuth(EditTicketsPage, { requireAuth: true });
