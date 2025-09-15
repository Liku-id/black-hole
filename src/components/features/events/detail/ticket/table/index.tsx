import { Box, Table, TableCell, TableRow } from '@mui/material';
import { FC } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { TicketType } from '@/types/event';
import { dateUtils, formatPrice } from '@/utils';

interface EventDetailTicketTableProps {
  ticketTypes: TicketType[];
  loading?: boolean;
}

export const EventDetailTicketTable: FC<EventDetailTicketTableProps> = ({
  ticketTypes,
  loading = false
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="text.secondary">Loading tickets...</Body2>
      </Box>
    );
  }

  // Transform ticketTypes data to match display format
  const formatTicketData = (ticket: TicketType) => {
    const salesStartDate = ticket.sales_start_date
      ? dateUtils.formatDateTimeWIB(ticket.sales_start_date)
      : '-';
    const salesEndDate = ticket.sales_end_date
      ? dateUtils.formatDateTimeWIB(ticket.sales_end_date)
      : '-';

    return {
      ...ticket,
      salesStartDate,
      salesEndDate
    };
  };

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
            <TableCell sx={{ width: '20%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Ticket Name
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '17.5%' }}>
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
            <TableCell sx={{ width: '17.5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Sale Start Date
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '17.5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Sale End Date
              </Body2>
            </TableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {ticketTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Box display="flex" justifyContent="center" padding="40px">
                  <Body2 color="text.secondary">No tickets found.</Body2>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            ticketTypes.map((ticket, index) => {
              const formattedTicket = formatTicketData(ticket);
              return (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Body2>{index + 1}.</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>{ticket.name}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>{formatPrice(ticket.price)}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>{ticket.quantity}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>{ticket.max_order_quantity} Ticket</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>{formattedTicket.salesStartDate}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>{formattedTicket.salesEndDate}</Body2>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </StyledTableBody>
      </Table>
    </StyledTableContainer>
  );
};
