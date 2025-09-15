import { Box, IconButton, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import {
  Body2,
  Button,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { EventDetail, TicketType } from '@/types/event';
import { formatPrice } from '@/utils';

interface TicketChangeInfo {
  newTickets: TicketType[];
  updatedTickets: TicketType[];
  deletedTicketIds: string[];
}

interface EventTicketsEditFormProps {
  eventDetail?: EventDetail;
  onTicketsChange?: (changeInfo: TicketChangeInfo) => void;
  showError?: boolean;
  onAddTicket?: () => void;
  onEditTicket?: (ticket: TicketType) => void;
}

export const EventTicketsEditForm = ({
  eventDetail,
  onTicketsChange,
  showError = false,
  onAddTicket,
  onEditTicket
}: EventTicketsEditFormProps) => {
  const [newTickets] = useState<TicketType[]>([]);
  const [updatedTickets] = useState<TicketType[]>([]);
  const [deletedTicketIds, setDeletedTicketIds] = useState<string[]>([]);
  const [removedFromDisplay, setRemovedFromDisplay] = useState<string[]>([]);

  const existingTickets = eventDetail?.ticketTypes || [];
  const visibleExistingTickets = existingTickets.filter(
    (ticket) => !removedFromDisplay.includes(ticket.id)
  );

  const notifyChanges = () => {
    onTicketsChange?.({
      newTickets,
      updatedTickets,
      deletedTicketIds
    });
  };

  const handleDeleteTicket = (ticketId: string) => {
    // Remove from display immediately
    setRemovedFromDisplay((prev) => [...prev, ticketId]);

    // Add to deleted list for backend
    setDeletedTicketIds((prev) => [...prev, ticketId]);

    notifyChanges();
  };

  const handleEditTicket = (ticket: TicketType) => {
    onEditTicket?.(ticket);
  };

  const handleAddTicket = () => {
    onAddTicket?.();
  };

  // Initialize form
  useEffect(() => {
    if (eventDetail) {
      notifyChanges();
    }
  }, [eventDetail]);

  const allTickets = [...visibleExistingTickets, ...newTickets];

  return (
    <Box>
      {/* Tickets Table */}
      {allTickets.length > 0 ? (
        <StyledTableContainer>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell sx={{ width: '5%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    No.
                  </Body2>
                </TableCell>
                <TableCell sx={{ width: '15%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Ticket Name
                  </Body2>
                </TableCell>
                <TableCell sx={{ width: '12.5%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Ticket Price
                  </Body2>
                </TableCell>
                <TableCell sx={{ width: '10%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Quantity
                  </Body2>
                </TableCell>
                <TableCell sx={{ width: '12.5%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Max. Per User
                  </Body2>
                </TableCell>
                <TableCell sx={{ width: '20%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Sale Start Date
                  </Body2>
                </TableCell>
                <TableCell sx={{ width: '20%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Sale End Date
                  </Body2>
                </TableCell>
                <TableCell align="right" sx={{ width: '5%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Action
                  </Body2>
                </TableCell>
              </TableRow>
            </StyledTableHead>
            <StyledTableBody>
              {allTickets.map((ticket, index) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {index + 1}.
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {ticket.name}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2
                      color="primary.main"
                      fontSize="14px"
                      fontWeight={700}
                    >
                      {formatPrice(ticket.price)}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {ticket.quantity}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {ticket.max_order_quantity}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {ticket.sales_start_date}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {ticket.sales_end_date}
                    </Body2>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        sx={{ color: 'text.secondary', cursor: 'pointer' }}
                        onClick={() => handleEditTicket(ticket)}
                      >
                        <Image
                          alt="Edit"
                          height={24}
                          src="/icon/edit.svg"
                          width={24}
                        />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: 'text.secondary', cursor: 'pointer' }}
                        onClick={() => handleDeleteTicket(ticket.id)}
                      >
                        <Image
                          alt="Delete"
                          height={24}
                          src="/icon/trash.svg"
                          width={24}
                        />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </StyledTableBody>
          </Table>
        </StyledTableContainer>
      ) : (
        <Box
          alignItems="center"
          bgcolor="background.paper"
          border="2px dashed"
          borderColor={showError ? 'error.main' : 'grey.100'}
          borderRadius="8px"
          display="flex"
          height="200px"
          justifyContent="center"
        >
          <Box textAlign="center">
            <Body2
              color={showError ? 'error.main' : 'text.secondary'}
              marginBottom="8px"
            >
              {showError
                ? 'At least one ticket is required'
                : 'No tickets created yet'}
            </Body2>
            <Button variant="secondary" onClick={handleAddTicket}>
              + add new ticket category
            </Button>
          </Box>
        </Box>
      )}

      {/* Add New Ticket Button */}
      {allTickets.length > 0 && (
        <Box display="flex" justifyContent="flex-end" marginBottom="24px">
          <Button variant="secondary" onClick={handleAddTicket}>
            + add new ticket category
          </Button>
        </Box>
      )}
    </Box>
  );
};
