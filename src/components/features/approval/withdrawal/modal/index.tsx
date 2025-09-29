import { Box } from '@mui/material';
import { useState } from 'react';

import { Button, Modal, TextField, Overline } from '@/components/common';

interface WithdrawalActionModalProps {
  open: boolean;
  onClose: () => void;
  onAction: (data: {
    action: 'approve' | 'reject';
    rejectionReason?: string;
  }) => void;
  errorMessage?: string;
  loading?: boolean;
}

const WithdrawalActionModal = ({
  open,
  onClose,
  onAction,
  errorMessage,
  loading = false
}: WithdrawalActionModalProps) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const isRejectValid = () => {
    return rejectionReason.trim() !== '';
  };

  const isApproveValid = () => {
    return rejectionReason.trim() === '';
  };

  const handleActionClick = (action: 'approve' | 'reject') => {
    if (action === 'reject' && !isRejectValid()) {
      return;
    }
    onAction({
      action,
      rejectionReason: action === 'reject' ? rejectionReason : undefined
    });
    setRejectionReason('');
  };

  const footer = (
    <Box>
      {errorMessage && (
        <Box marginBottom={2} display="flex" justifyContent="center">
          <Overline color="error.main">{errorMessage}</Overline>
        </Box>
      )}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="secondary"
          onClick={() => handleActionClick('reject')}
          disabled={!isRejectValid() || loading}
        >
          Reject
        </Button>
        <Button
          variant="primary"
          onClick={() => handleActionClick('approve')}
          disabled={!isApproveValid() || loading}
        >
          Approve
        </Button>
      </Box>
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Withdrawal Action"
      footer={footer}
    >
      <Box marginBottom={2}>
        <TextField
          fullWidth
          label="Rejection Reason"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason (required for reject action)"
        />
      </Box>
    </Modal>
  );
};

export default WithdrawalActionModal;
