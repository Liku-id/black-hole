import { Box, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { FC, useState } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { TicketType } from '@/types/event';
import { dateUtils, formatPrice } from '@/utils';

import { TicketDetailModal } from './modal';

interface EventDetailTicketTableProps {
  ticketTypes: TicketType[];
  loading?: boolean;
}

export const EventDetailTicketTable: FC<EventDetailTicketTableProps> = ({
  ticketTypes,
  loading = false
}) => {
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetail = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

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
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
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
              <TableCell sx={{ width: '5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {ticketTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
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
                    <TableCell>
                      <Box
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleViewDetail(ticket)}
                      >
                        <Image
                          alt="View detail"
                          height={20}
                          src="/icon/eye.svg"
                          width={20}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        open={modalOpen}
        ticket={selectedTicket}
        onClose={handleCloseModal}
      />
    </>
  );
};
