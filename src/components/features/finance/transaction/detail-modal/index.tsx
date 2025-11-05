import { Box } from '@mui/material';
import { FC } from 'react';

import { Modal, Body2, Button } from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { formatUtils, dateUtils } from '@/utils';

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: any;
}

export const TransactionDetailModal: FC<TransactionDetailModalProps> = ({
  open,
  onClose,
  transaction
}) => {
  if (!transaction) return null;

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
          Ticket Type
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.ticketType?.name || '-'}
        </Body2>
      </Box>

      {/* Total Ticket */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Total Ticket
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.orderQuantity || 0} Ticket
        </Body2>
      </Box>

      {/* Ticket Price */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Ticket Price
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {formatUtils.formatPrice(transaction.ticketType.price) || 0}
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
          {transaction.paymentBreakdown?.tax ? formatUtils.formatPrice(transaction.paymentBreakdown?.tax) : '-'}
        </Body2>
      </Box>

      {/* Admin Fee */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Admin Fee
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.event.adminFee
            ? transaction.event.adminFee < 100
              ? formatUtils.formatPrice(
                (transaction.event.adminFee / 100) *
                transaction.paymentBreakdown.basedPrice
              )
              : formatUtils.formatPrice(transaction.event.adminFee)
            : '-'}
        </Body2>
      </Box>

      {/* Transaction Fee */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Transaction Fee
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.paymentMethod?.paymentMethodFee
            ? transaction.paymentMethod.paymentMethodFee < 1
              ? formatUtils.formatPrice(
                (transaction.paymentMethod.paymentMethodFee / 100) *
                transaction.paymentBreakdown.basedPrice
              )
              : formatUtils.formatPrice(
                transaction.paymentMethod.paymentMethodFee
              )
            : '-'}
        </Body2>
      </Box>

      {/* Total Payment */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary" fontSize="14px">
          Total Payment
        </Body2>
        <Body2 color="text.primary" fontSize="14px">
          {transaction.paymentBreakdown?.basedPrice
            ? formatUtils.formatPrice(
                transaction.paymentBreakdown.basedPrice + 
                transaction.paymentBreakdown.tax + 
                (transaction.event?.adminFee
                  ? transaction.event.adminFee < 100
                    ? (transaction.event.adminFee / 100) * transaction.paymentBreakdown.basedPrice
                    : transaction.event.adminFee
                  : 0) + 
                (transaction.paymentMethod?.paymentMethodFee 
                  ? transaction.paymentMethod.paymentMethodFee < 1
                    ? transaction.paymentMethod.paymentMethodFee * transaction.paymentBreakdown.basedPrice / 100
                    : transaction.paymentMethod.paymentMethodFee
                  : 0)
              )
            : '-'}
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
      height={500}
      open={open}
      title="Transaction Detail"
      width={400}
      onClose={onClose}
    >
      {modalContent}
    </Modal>
  );
};
