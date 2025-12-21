import { Box, IconButton, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { FC } from 'react';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { formatPrice, dateUtils } from '@/utils';
import { StatusBadge } from '../../../status-badge';

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
  status?: string;
  rejectedFields?: string[];
  rejectedReason?: string;
}

interface TicketTableProps {
  tickets: TicketCategory[];
  loading?: boolean;
  eventStatus?: string;
  onEdit?: (ticket: TicketCategory) => void;
  onDelete?: (ticketId: string) => void;
}

const TicketTable: FC<TicketTableProps> = ({
  tickets,
  loading = false,
  eventStatus,
  onEdit,
  onDelete
}) => {
  const statusMap = {
    approved: 'on_going',
    rejected: 'rejected',
    pending: 'pending'
  };

  // Check if action buttons should be shown for a ticket
  const shouldShowActions = (ticket: TicketCategory) => {
    // For upcoming (approved) or ongoing events, hide actions for approved tickets
    if (
      (eventStatus === 'approved' || eventStatus === 'on_going') &&
      ticket.status === 'approved'
    ) {
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="text.secondary">Loading tickets...</Body2>
      </Box>
    );
  }

  return (
    <StyledTableContainer>
      <Table>
        <StyledTableHead>
          <TableRow>
            <TableCell sx={{ width: '4%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                No.
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Ticket Name
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '12%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Ticket Price
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '8%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Quantity
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '12%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Max. Per User
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
            <TableCell sx={{ width: '9%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Status
              </Body2>
            </TableCell>
            <TableCell align="left" sx={{ width: '8%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Action
              </Body2>
            </TableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9}>
                <Box display="flex" justifyContent="center" padding="40px">
                  <Body2 color="text.secondary">
                    No tickets found. Add your first ticket category.
                  </Body2>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket, index) => (
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
                  <Body2 color="primary.main" fontSize="14px" fontWeight={700}>
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
                    {ticket.maxPerUser}
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
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        sx={{ color: 'text.secondary', cursor: 'pointer' }}
                        onClick={() => onEdit?.(ticket)}
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
                        onClick={() => onDelete?.(ticket.id)}
                      >
                        <Image
                          alt="Delete"
                          height={24}
                          src="/icon/trash.svg"
                          width={24}
                        />
                      </IconButton>
                    </Box>
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
  );
};

export default TicketTable;
