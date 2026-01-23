import { Box, IconButton, Table, TableCell, TableRow, Menu, MenuItem } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { TicketType } from '@/types/event';
import { formatPrice, dateUtils } from '@/utils';

import { StatusBadge } from '../../../status-badge';

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
}

interface GroupTicketTableProps {
  groupTickets: GroupTicketCategory[];
  eventStatus?: string;
  ticketTypes: TicketType[];
  onDelete: (ticketId: string) => void;
  onEdit: (ticket: GroupTicketCategory) => void;
}

export const GroupTicketTable = ({
  groupTickets,
  eventStatus,
  ticketTypes,
  onDelete,
  onEdit
}: GroupTicketTableProps) => {
  const statusMap = {
    approved: 'on_going',
    rejected: 'rejected',
    pending: 'pending'
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTicket, setActiveTicket] = useState<GroupTicketCategory | null>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    ticket: GroupTicketCategory
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveTicket(ticket);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveTicket(null);
  };

  const getTicketTypeName = (ticketTypeId: string) => {
    const ticketType = ticketTypes.find((tt) => tt.id === ticketTypeId);
    return ticketType?.name || 'Unknown';
  };

  // Check if action buttons should be shown for a ticket
  const shouldShowActions = (ticket: GroupTicketCategory) => {
    // For upcoming (approved) or ongoing events, hide actions for approved tickets
    if (
      (eventStatus === 'approved' || eventStatus === 'on_going') &&
      ticket.status === 'approved'
    ) {
      return false;
    }
    return true;
  };

  return (
    <>
      <StyledTableContainer>
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  No.
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Type
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Price
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '8%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Quantity
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '8%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Bundle Qty
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Max. Ticket per user
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '13%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Sale Start Date
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '13%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Sale End Date
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Status
                </Body2>
              </TableCell>
              <TableCell align="right" sx={{ width: '6%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {groupTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <Box display="flex" justifyContent="center" padding="40px">
                    <Body2 color="text.secondary">
                      No tickets found. Add your first ticket category
                    </Body2>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              groupTickets.map((ticket, index) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {index + 1}.
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {getTicketTypeName(ticket.ticketTypeId)}
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
                      {ticket.bundleQuantity} Ticket
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {ticket.maxOrderQuantity}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {dateUtils.formatDateTimeWIB(ticket.salesStartDate)}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {dateUtils.formatDateTimeWIB(ticket.salesEndDate)}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    {ticket?.status ? (
                      <StatusBadge
                        status={statusMap[ticket.status]}
                        displayName={ticket.status}
                      />
                    ) : (
                      <Body2 color="text.primary" fontSize="14px">
                        -
                      </Body2>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {shouldShowActions(ticket) ? (
                      <IconButton
                        onClick={(e) => handleOpenMenu(e, ticket)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Image
                          alt="Actions"
                          height={24}
                          src="/icon/options.svg"
                          width={24}
                        />
                      </IconButton>
                    ) : (
                      <Body2 color="text.secondary" fontSize="14px">
                        -
                      </Body2>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 1,
          sx: {
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              gap: 1.5
            }
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeTicket) onEdit(activeTicket);
            handleCloseMenu();
          }}
        >
          <Image alt="Edit" height={20} src="/icon/edit.svg" width={20} />
          <Body2>Edit</Body2>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeTicket) onDelete(activeTicket.id);
            handleCloseMenu();
          }}
        >
          <Image alt="Delete" height={20} src="/icon/trash.svg" width={20} />
          <Body2 color="error.main">Delete</Body2>
        </MenuItem>
      </Menu>
    </>
  );
};
