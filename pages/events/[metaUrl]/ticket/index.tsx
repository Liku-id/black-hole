import { Box } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button, Card, H3, Body1, Breadcrumb } from '@/components/common';
import { TicketCreateModal } from '@/components/features/events/ticket/create-modal';
import TicketTable from '@/components/features/events/ticket/table';
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
  // Raw data for ISO conversion
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
  const [tickets, setTickets] = useState<TicketCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<
    TicketCategory | undefined
  >();

  // Prevent hydration error by checking if router is ready
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

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    console.log('Save draft');
  };

  const handleContinue = async () => {
    // if (tickets.length === 0) {
    // return;
    // }

    const ticketTypesPayload = tickets.map((ticket) => ({
      name: ticket.name,
      quantity: ticket.quantity,
      description: ticket.description,
      price: ticket.price,
      eventId: metaUrl as string,
      maxOrderQuantity: ticket.maxPerUser,
      colorHex: ticket.colorHex,
      // Format like events/create: ${date}T${time}:00${timeZone}
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

    console.log('Ticket Types Payload:', ticketTypesPayload);

    try {
      console.log(ticketTypesPayload);
      const response =
        await ticketsService.createTicketTypes(ticketTypesPayload);

      if (response.body?.ticketTypes) {
        alert(
          `Successfully created ${response.body.ticketTypes.length} ticket types!`
        );
        // TODO: Navigate to next step
      }
    } catch (error: any) {
      console.error('Failed to create ticket types:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create ticket types. Please try again.';

      alert(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <H3 color="text.primary" fontWeight={700} marginBottom="16px">
          Create Event
        </H3>

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

export default TicketPage;
