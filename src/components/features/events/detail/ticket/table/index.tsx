import { Box, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { FC, useState } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { TicketReviewModal } from '@/components/features/approval/events/modal/ticket-review';
import { TicketType } from '@/types/event';
import { dateUtils, formatPrice } from '@/utils';

import { StatusBadge } from '../../../status-badge';

import { TicketDetailModal } from './modal';

interface EventDetailTicketTableProps {
  ticketTypes: TicketType[];
  loading?: boolean;
  approvalMode?: boolean;
  onApproveTicket?: (ticketId: string) => void;
  onRejectTicket?: (ticketId: string, rejectedFields: string[]) => void;
  error?: string | null;
  showStatus?: boolean;
  onEditAdditionalForm?: (ticketId: string) => void;
}

export const EventDetailTicketTable: FC<EventDetailTicketTableProps> = ({
  ticketTypes,
  loading = false,
  approvalMode = false,
  onApproveTicket,
  onRejectTicket,
  error = null,
  showStatus = false,
  onEditAdditionalForm
}) => {
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const statusMap = {
    approved: 'on_going',
    rejected: 'rejected',
    pending: 'pending'
  };

  const handleViewDetail = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  // Determine which modal to show based on approval mode and ticket status
  // Show review modal only for tickets that haven't been reviewed yet (no status or pending)
  // Show regular modal for approved or rejected tickets (read-only view)
  const shouldShowReviewModal =
    approvalMode &&
    selectedTicket?.status !== 'approved' &&
    selectedTicket?.status !== 'rejected';

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  const handleApprove = (ticketId: string) => {
    if (onApproveTicket) {
      onApproveTicket(ticketId);
      handleCloseModal();
    }
  };

  const handleReject = (ticketId: string, rejectedFields: string[]) => {
    if (onRejectTicket) {
      onRejectTicket(ticketId, rejectedFields);
    }
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
              <TableCell sx={{ width: '3%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  No.
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '23%' }}>
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
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Sale Start Date
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Sale End Date
                </Body2>
              </TableCell>
              {showStatus && (
                <TableCell sx={{ width: '8%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Status
                  </Body2>
                </TableCell>
              )}
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
                <TableCell colSpan={showStatus ? 9 : 8}>
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
                    {showStatus && (
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
                    )}
                    <TableCell>
                      <Box display="flex" gap={1} alignItems="center">
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
                        {!approvalMode && onEditAdditionalForm && (
                          <Box
                            sx={{ cursor: 'pointer' }}
                            onClick={() => onEditAdditionalForm(ticket.id)}
                            title="Edit Additional Form"
                          >
                            <Image
                              alt="Edit Additional Form"
                              height={20}
                              src="/icon/file.svg"
                              width={20}
                            />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>

      {/* Ticket Detail Modal - Show Review Modal only if not approved */}
      {shouldShowReviewModal ? (
        <TicketReviewModal
          open={modalOpen}
          ticket={selectedTicket}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
          error={error}
        />
      ) : (
        <TicketDetailModal
          open={modalOpen}
          ticket={selectedTicket}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
