import { Box } from '@mui/material';
import { FC } from 'react';

import { Modal, Body2, Button } from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { Transaction } from '@/types/transaction';
import { formatUtils, dateUtils } from '@/utils';

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailModal: FC<TransactionDetailModalProps> = ({
  open,
  onClose,
  transaction
}) => {
  if (!transaction) return null;

  // Calculate admin fee
  const calculateAdminFee = (adminFee: number, basedPrice: number): number => {
    if (!adminFee) return 0;
    if (adminFee < 100) {
      return (adminFee / 100) * basedPrice;
    }
    return adminFee;
  };

  // Calculate payment method fee
  const calculatePaymentMethodFee = (
    paymentMethodFee: number,
    basedPrice: number
  ): number => {
    if (!paymentMethodFee) return 0;
    if (paymentMethodFee < 1) {
      return (paymentMethodFee / 100) * basedPrice;
    }
    return paymentMethodFee;
  };

  // Extract payment breakdown data
  const paymentBreakdown = transaction.paymentBreakdown;
  const basedPrice = paymentBreakdown?.basedPrice || 0;
  const tax = paymentBreakdown?.tax || 0;
  const adminFee = transaction.event?.adminFee || 0;
  const paymentMethodFee = transaction.paymentMethod?.paymentMethodFee || 0;

  // Calculate fees
  const calculatedAdminFee = calculateAdminFee(adminFee, basedPrice);
  const calculatedPaymentMethodFee = calculatePaymentMethodFee(
    paymentMethodFee,
    basedPrice
  );
  const totalPayment =
    basedPrice > 0
      ? basedPrice + tax + calculatedAdminFee + calculatedPaymentMethodFee
      : null;

  const modalContent = (
    <Box display="flex" flexDirection="column" gap="12px">
      {/* Name */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Name
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.name || '-'}
        </Body2>
      </Box>

      {/* Event Name */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Event Name
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.event?.name || '-'}
        </Body2>
      </Box>

      {/* Ticket Type */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          {transaction.group_ticket ? 'Group Ticket' : 'Ticket Type'}
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.group_ticket?.name || transaction.ticketType?.name || '-'}
        </Body2>
      </Box>

      {/* Total Ticket */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          {transaction.group_ticket ? 'Total Bundle' : 'Total Ticket'}
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.group_ticket 
            ? `${transaction.orderQuantity || 0} Bundle` 
            : `${transaction.orderQuantity || 0} Ticket`}
        </Body2>
      </Box>

      {/* Tickets per Bundle (for group tickets only) */}
      {transaction.group_ticket && (
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Body2 color="text.secondary" fontSize="14px">
            Tickets per Bundle
          </Body2>
          <Body2 color="text.primary" fontSize="14px">
            {transaction.group_ticket.bundle_quantity} Tickets
          </Body2>
        </Box>
      )}

      {/* Total Tickets (for group tickets only) */}
      {transaction.group_ticket && (
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Body2 color="text.secondary" fontSize="14px">
            Total Tickets
          </Body2>
          <Body2 color="text.primary" fontSize="14px">
            {(transaction.orderQuantity || 0) * transaction.group_ticket.bundle_quantity} Tickets
          </Body2>
        </Box>
      )}

      {/* Ticket Price */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          {transaction.group_ticket ? 'Price per Bundle' : 'Ticket Price'}
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {(() => {
            // For group tickets
            if (transaction.group_ticket) {
              const orderQuantity = transaction.orderQuantity || 1;
              const basedPrice = paymentBreakdown?.basedPrice || 0;
              const pricePerBundle = basedPrice / orderQuantity;
              return formatUtils.formatPrice(pricePerBundle);
            }
            
            // For single tickets - check if there's a discount
            const originalPrice = transaction.ticketType?.price || 0;
            const orderQuantity = transaction.orderQuantity || 1;
            const basedPrice = paymentBreakdown?.basedPrice || 0;

            // Check if there's a discount (basedPrice is less than original price * quantity)
            const totalOriginalPrice = originalPrice * orderQuantity;
            const hasDiscount =
              basedPrice > 0 && basedPrice < totalOriginalPrice;

            if (hasDiscount) {
              // Calculate price per ticket after discount
              const pricePerTicket = basedPrice / orderQuantity;
              return formatUtils.formatPrice(pricePerTicket);
            }

            // Otherwise, show original price
            return formatUtils.formatPrice(originalPrice) || '0';
          })()}
        </Body2>
      </Box>

      {/* Transaction Number */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Transaction Number
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.transactionNumber || '-'}
        </Body2>
      </Box>

      {/* Tax */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Tax
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.paymentBreakdown?.tax
            ? formatUtils.formatPrice(transaction.paymentBreakdown?.tax)
            : '-'}
        </Body2>
      </Box>

      {/* Admin Fee */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Admin Fee
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {calculatedAdminFee > 0
            ? formatUtils.formatPrice(calculatedAdminFee)
            : '-'}
        </Body2>
      </Box>

      {/* Transaction Fee */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Transaction Fee
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {calculatedPaymentMethodFee > 0
            ? formatUtils.formatPrice(calculatedPaymentMethodFee)
            : '-'}
        </Body2>
      </Box>

      {/* Total Payment */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Total Payment
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {totalPayment !== null ? formatUtils.formatPrice(totalPayment) : '-'}
        </Body2>
      </Box>

      {/* Date */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Date
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.createdAt
            ? dateUtils.formatDateTimeWIB(transaction.createdAt)
            : '-'}
        </Body2>
      </Box>

      {/* Payment Method */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Payment Method
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.paymentMethod?.name || '-'}
        </Body2>
      </Box>

      {/* Status Payment */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Status Payment
        </Body2>
        <StatusBadge status={transaction.status || 'UNKNOWN'} />
      </Box>
    </Box>
  );

  const modalFooter = (
    <Box display="flex" justifyContent="flex-end">
      <Button variant="primary" onClick={onClose}>
        Back
      </Button>
    </Box>
  );

  return (
    <Modal
      footer={modalFooter}
      height={600}
      open={open}
      title="Transaction Detail"
      width={550}
      onClose={onClose}
    >
      {modalContent}
    </Modal>
  );
};
