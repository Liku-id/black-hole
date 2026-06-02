import { Box, Table, TableCell, TableRow, Switch } from '@mui/material';
import Image from 'next/image';
import { FC, useState } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { TicketReviewModal } from '@/components/features/approval/events/modal/ticket-review';
import { TicketType, GroupTicket } from '@/types/event';
import { dateUtils, formatPrice } from '@/utils';
import { Discount, discountsService } from '@/services/discounts';

import { StatusBadge } from '../../../status-badge';

import { TicketDetailModal } from './modal';
import { DiscountModal } from './modal/DiscountModal';

interface EventDetailTicketTableProps {
  ticketTypes: TicketType[] | GroupTicket[];
  loading?: boolean;
  approvalMode?: boolean;
  onApproveTicket?: (ticketId: string) => void;
  onRejectTicket?: (ticketId: string, rejectedFields: string[]) => void;
  error?: string | null;
  showStatus?: boolean;
  onEditAdditionalForm?: (ticketId: string) => void;
  onTogglePublic?: (ticketId: string, isPublic: boolean) => void;
  visibilityLoadingId?: string | null;
  discounts?: Discount[];
  sessionRole?: string;
  onDiscountsChange?: () => Promise<void>;
  eventStatus?: string;
}

export const EventDetailTicketTable: FC<EventDetailTicketTableProps> = ({
  ticketTypes,
  loading = false,
  approvalMode = false,
  onApproveTicket,
  onRejectTicket,
  error = null,
  showStatus = false,
  onEditAdditionalForm,
  onTogglePublic,
  visibilityLoadingId = null,
  discounts = [],
  sessionRole,
  onDiscountsChange,
  eventStatus
}) => {
  const [selectedTicket, setSelectedTicket] = useState<TicketType | GroupTicket | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedDiscountTicket, setSelectedDiscountTicket] = useState<any>(null);


  const statusMap = {
    approved: 'on_going',
    rejected: 'rejected',
    pending: 'pending'
  };

  const handleViewDetail = (ticket: TicketType | GroupTicket) => {
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
  const formatTicketData = (ticket: TicketType | GroupTicket) => {
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
              <TableCell sx={{ width: '6%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Quantity
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
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
              <TableCell sx={{ width: '8%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Visibility
                </Body2>
              </TableCell>
              {showStatus && (
                <TableCell sx={{ width: '8%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Status
                  </Body2>
                </TableCell>
              )}
              <TableCell sx={{ width: '9%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {ticketTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showStatus ? 10 : 9}>
                  <Box display="flex" justifyContent="center" padding="40px">
                    <Body2 color="text.secondary">No tickets found.</Body2>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              ticketTypes.map((ticket, index) => {
                const formattedTicket = formatTicketData(ticket);
                const isGroupTicketType = 'bundle_quantity' in ticket;
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Body2>{index + 1}.</Body2>
                    </TableCell>
                    <TableCell>
                      <Body2>{ticket.name}</Body2>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        {(() => {
                          const ticketDiscount = !isGroupTicketType && discounts
                            ? discounts.find((d) => d.ticket_type_id === ticket.id)
                            : undefined;

                          if (ticketDiscount) {
                            if (ticketDiscount.status === 'approved') {
                              const discountAmount = ticketDiscount.value <= 100
                                ? (ticket.price * ticketDiscount.value) / 100
                                : ticketDiscount.value;
                              const discountedPrice = Math.max(0, ticket.price - discountAmount);

                              return (
                                <>
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <Body2 sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '11px' }}>
                                      {formatPrice(ticket.price)}
                                    </Body2>
                                    <Box
                                      bgcolor="success.light"
                                      color="success.main"
                                      borderRadius="4px"
                                      padding="1px 4px"
                                      display="inline-flex"
                                      fontSize="10px"
                                      fontWeight={700}
                                    >
                                      {ticketDiscount.value <= 100 ? `-${ticketDiscount.value}%` : `-${formatPrice(ticketDiscount.value)}`}
                                    </Box>
                                  </Box>
                                  <Body2 color="success.main" fontWeight={600} fontSize="14px">
                                    {formatPrice(discountedPrice)}
                                  </Body2>
                                </>
                              );
                            } else {
                              return (
                                <>
                                  <Body2>{formatPrice(ticket.price)}</Body2>
                                  <Box display="inline-flex" alignSelf="flex-start" mt={0.5}>
                                    <StatusBadge
                                      status={ticketDiscount.status}
                                      displayName={`Disc: ${ticketDiscount.status}`}
                                    />
                                  </Box>
                                </>
                              );
                            }
                          }

                          return <Body2>{formatPrice(ticket.price)}</Body2>;
                        })()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Body2>{ticket.quantity - ticket.purchased_amount}/{ticket.quantity}</Body2>
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
                    {'is_public' in ticket && (
                      <TableCell>
                        <Switch
                          checked={ticket.is_public ?? true}
                          onChange={(e) => onTogglePublic?.(ticket.id, e.target.checked)}
                          disabled={!onTogglePublic || visibilityLoadingId === ticket.id}
                          size="small"
                        />
                      </TableCell>
                    )}
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
                      <Box display="flex" gap={1.5} alignItems="center">
                        <Box
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleViewDetail(ticket)}
                          title="View detail"
                        >
                          <Image
                            alt="View detail"
                            height={20}
                            src="/icon/eye.svg"
                            width={20}
                          />
                        </Box>
                        {(!approvalMode || discounts.some(d => d.ticket_type_id === ticket.id)) && !isGroupTicketType && (
                          <Box
                            sx={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedDiscountTicket(ticket);
                              setDiscountModalOpen(true);
                            }}
                            title={approvalMode ? "Review Discount" : "Manage Discount"}
                          >
                            <Image
                              alt={approvalMode ? "Review Discount" : "Manage Discount"}
                              height={20}
                              src="/icon/coupon.svg"
                              width={20}
                            />
                          </Box>
                        )}
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
          discount={selectedTicket ? discounts.find(d => d.ticket_type_id === selectedTicket.id) || null : null}
          onClose={handleCloseModal}
        />
      )}

      {/* Discount Modal */}
      {discountModalOpen && selectedDiscountTicket && (
        <DiscountModal
          open={discountModalOpen}
          onClose={() => {
            setDiscountModalOpen(false);
            setSelectedDiscountTicket(null);
          }}
          ticket={selectedDiscountTicket}
          discount={discounts.find(d => d.ticket_type_id === selectedDiscountTicket.id) || null}
          sessionRole={sessionRole}
          onSave={async (payload) => {
            const activeDiscount = discounts.find(d => d.ticket_type_id === selectedDiscountTicket.id);
            if (activeDiscount) {
              await discountsService.updateDiscount(activeDiscount.id, payload);
            } else {
              await discountsService.createDiscount(payload);
            }
            await onDiscountsChange?.();
          }}
          onDelete={async (id) => {
            await discountsService.deleteDiscount(id);
            await onDiscountsChange?.();
          }}
          onApproveReject={async (id, status, reason) => {
            await discountsService.approveRejectDiscount(id, { status, rejected_reason: reason });
            await onDiscountsChange?.();
          }}
          eventStatus={eventStatus}
          approvalMode={approvalMode}
        />
      )}
    </>
  );
};
