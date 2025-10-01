import { Box } from '@mui/material';
import { FC } from 'react';

import { Modal, Body2, Caption } from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { formatUtils, dateUtils, truncate } from '@/utils';
import { WithdrawalListItem } from '@/services/withdrawal';

interface WithdrawalDetailModalProps {
  open: boolean;
  onClose: () => void;
  withdrawal: WithdrawalListItem | null;
}

const WithdrawalDetailModal: FC<WithdrawalDetailModalProps> = ({
  open,
  onClose,
  withdrawal
}) => {
  if (!withdrawal) return null;

  const modalContent = (
    <Box display="flex" flexDirection="column" gap="12px">
      {/* Withdrawal ID */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Withdrawal ID</Body2>
        <Body2 color="text.primary">{withdrawal.withdrawalId || '-'}</Body2>
      </Box>

      {/* Withdrawal Name */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Withdrawal Name</Body2>
        <Body2 color="text.primary">{withdrawal.withdrawalName || '-'}</Body2>
      </Box>

      {/* Event Name */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Event Name</Body2>
        <Body2 color="text.primary">
          {truncate(withdrawal.eventName, 25) || '-'}
        </Body2>
      </Box>

      {/* Requested Amount */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Requested Amount</Body2>
        <Body2 color="text.primary">
          {formatUtils.formatPrice(parseFloat(withdrawal.requestedAmount))}
        </Body2>
      </Box>

      {/* Amount Received */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Amount Received</Body2>
        <Body2 color="text.primary">
          {formatUtils.formatPrice(
            parseFloat((withdrawal as any).amountReceived || '0')
          )}
        </Body2>
      </Box>

      {/* Bank Name */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Bank Name</Body2>
        <Body2 color="text.primary">{withdrawal.bankName || '-'}</Body2>
      </Box>

      {/* Account Number */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Account Number</Body2>
        <Body2 color="text.primary">{withdrawal.accountNumber || '-'}</Body2>
      </Box>

      {/* Account Holder Name */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Account Holder Name</Body2>
        <Body2 color="text.primary">
          {truncate(withdrawal.accountHolderName, 25) || '-'}
        </Body2>
      </Box>

      {/* Request Date */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Request Date</Body2>
        <Body2 color="text.primary">
          {withdrawal.createdAt
            ? dateUtils.formatDateDDMMYYYY(withdrawal.createdAt)
            : '-'}
        </Body2>
      </Box>

      {/* Status */}
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Body2 color="text.secondary">Status</Body2>
        <StatusBadge
          status={withdrawal.status || 'UNKNOWN'}
          displayName={withdrawal.status === 'APPROVED' ? 'Approved' : ''}
        />
      </Box>

      {/* Approved By (if approved) */}
      {withdrawal.approvedBy && (
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Body2 color="text.secondary">Approved By</Body2>
          <Caption color="text.primary">{withdrawal.approvedBy}</Caption>
        </Box>
      )}

      {/* Approved At (if approved) */}
      {withdrawal.approvedAt && (
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Body2 color="text.secondary">Approved At</Body2>
          <Body2 color="text.primary">
            {dateUtils.formatDateDDMMYYYY(withdrawal.approvedAt)}
          </Body2>
        </Box>
      )}

      {/* Rejected By (if rejected) */}
      {withdrawal.rejectedBy && (
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Body2 color="text.secondary">Rejected By</Body2>
          <Caption color="text.primary">{withdrawal.rejectedBy}</Caption>
        </Box>
      )}

      {/* Rejected At (if rejected) */}
      {withdrawal.rejectedAt && (
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Body2 color="text.secondary">Rejected At</Body2>
          <Body2 color="text.primary">
            {dateUtils.formatDateDDMMYYYY(withdrawal.rejectedAt)}
          </Body2>
        </Box>
      )}

      {/* Rejection Reason (if exists) */}
      {(withdrawal as any).rejectionReason && (
        <Box alignItems="center" display="flex" justifyContent="space-between">
          <Body2 color="text.secondary">Rejection Reason</Body2>
          <Body2 color="error.main">
            {(withdrawal as any).rejectionReason}
          </Body2>
        </Box>
      )}
    </Box>
  );

  return (
    <Modal
      height={500}
      open={open}
      title="Withdrawal Detail"
      width={400}
      onClose={onClose}
    >
      {modalContent}
    </Modal>
  );
};

export default WithdrawalDetailModal;
