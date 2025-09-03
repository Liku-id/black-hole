import { Box, IconButton, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { FC } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { dateUtils, formatPrice } from '@/utils';

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
}

interface TicketTableProps {
  tickets: TicketCategory[];
  loading?: boolean;
  onEdit?: (ticket: TicketCategory) => void;
  onDelete?: (ticketId: string) => void;
}

const TicketTable: FC<TicketTableProps> = ({
  tickets,
  loading = false,
  onEdit,
  onDelete
}) => {
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
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
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
                    {ticket.salesStartDate}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {ticket.salesEndDate}
                  </Body2>
                </TableCell>
                <TableCell align="right">
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
