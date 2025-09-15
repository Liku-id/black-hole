import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { Button, Card, H4, Body1, Breadcrumb, Overline } from '@/components/common';
import { TicketCreateModal } from '@/components/features/events/create/ticket/create-modal';
import TicketTable from '@/components/features/events/create/ticket/table';
import { useEventDetail } from '@/hooks/features/events/useEventDetail';
import DashboardLayout from '@/layouts/dashboard';
import { ticketsService } from '@/services/tickets';

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

const TicketPage = () => {
  const router = useRouter();
  const { metaUrl } = router.query;
  const { eventDetail } = useEventDetail(metaUrl as string);
  const [tickets, setTickets] = useState<TicketCategory[]>([]);
  const [error, setError] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<
    TicketCategory | undefined
  >();

  useEffect(() => {
    if (!router.isReady) return;
    if (eventDetail && eventDetail?.eventStatus !== 'draft') {
      router.replace('/events');
    }
  }, [router.isReady, eventDetail]);

  if (!router.isReady) {
    return null;
  }

  const breadcrumbSteps = [
    { label: 'Event Detail' },
    { label: 'Ticket Detail', active: true },
    { label: 'Asset Event' }
  ];

  const handleAddTicket = () => {
    setEditingTicket(undefined);
    setModalOpen(true);
  };

  const handleCreateTicket = async (data: any) => {
    if (editingTicket) {
      // Update existing ticket
      const updatedTickets = tickets.map((ticket) =>
        ticket.id === editingTicket.id
          ? {
              ...ticket,
              name: data.name,
              description: data.description,
              colorHex: data.colorHex,
              price: parseInt(data.price),
              quantity: parseInt(data.quantity),
              maxPerUser: parseInt(data.maxPerUser),
              salesStartDate: data.salesStartDate,
              salesEndDate: data.salesEndDate,
              ticketStartDate: data.ticketStartDate,
              ticketEndDate: data.ticketEndDate
            }
          : ticket
      );
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
    setEditingTicket(ticket);
    setModalOpen(true);
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
  };

  const onSubmit = async (redirectPath: string) => {
    const ticketTypesPayload = tickets.map((ticket) => ({
      name: ticket.name,
      quantity: ticket.quantity,
      description: ticket.description,
      price: ticket.price,
      eventId: eventDetail.id,
      maxOrderQuantity: ticket.maxPerUser,
      colorHex: ticket.colorHex,
      salesStartDate:
        ticket.salesStartRawDate &&
        ticket.salesStartTime &&
        ticket.salesStartTimeZone
          ? `${ticket.salesStartRawDate}T${ticket.salesStartTime}:00${ticket.salesStartTimeZone}`
          : ticket.salesStartDate,
      salesEndDate:
        ticket.salesEndRawDate && ticket.salesEndTime && ticket.salesEndTimeZone
          ? `${ticket.salesEndRawDate}T${ticket.salesEndTime}:00${ticket.salesEndTimeZone}`
          : ticket.salesEndDate,
      isPublic: true,
      ticketStartDate: ticket.ticketStartRawDate
        ? `${ticket.ticketStartRawDate}T00:00:00+07:00`
        : ticket.ticketStartDate,
      ticketEndDate: ticket.ticketEndRawDate
        ? `${ticket.ticketEndRawDate}T00:00:00+07:00`
        : ticket.ticketEndDate
    }));

    try {
      // Create each ticket type individually
      const responses = [];
      for (const ticketType of ticketTypesPayload) {
        const response = await ticketsService.createTicketType(ticketType);
        responses.push(response);
      }

      if (responses.length > 0) {
        setError('');
        router.push(redirectPath);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create ticket types. Please try again.';
      setError(errorMessage);
    }
  };

  const handleSaveDraft = async () => {
    await onSubmit('/events');
  };

  const handleContinue = async () => {
    await onSubmit(`/events/create/${metaUrl}/assets`);
  };

  

  return (
    <DashboardLayout>
      <Box>
        <H4 color="text.primary" fontWeight={700} marginBottom="16px">
          Create Event
        </H4>

        {/* Breadcrumb */}
        <Box marginBottom="24px">
          <Breadcrumb steps={breadcrumbSteps} />
        </Box>

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
          {error && (
            <Box marginBottom="8px">
              <Overline color="error.main">{error}</Overline>
            </Box>
          )}
          <Box
            display="flex"
            gap="24px"
            justifyContent="flex-end"
            marginBottom="24px"
          >
            <Button variant="secondary" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button variant="primary" onClick={handleContinue}>
              Continue
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
    </DashboardLayout>
  );
};

export default withAuth(TicketPage, { requireAuth: true });
