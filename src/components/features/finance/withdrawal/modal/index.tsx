import { Box } from '@mui/material';
import React from 'react';

import { Body2, Button, Modal, Overline } from '@/components/common';

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  error
}) => {
  return (
    <Modal
      footer={
        <>
          {error && (
            <Overline color="error.main" mb={1} textAlign="right">
              {error}
            </Overline>
          )}
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button disabled={loading} variant="secondary" onClick={onClose}>
              Back
            </Button>
            <Button disabled={loading} variant="primary" onClick={onConfirm}>
              {loading ? 'Processing...' : 'Yes, Withdraw'}
            </Button>
          </Box>
        </>
      }
      height={180}
      open={open}
      title="Withdrawal Confirmation"
      onClose={onClose}
    >
      <Body2 fontSize="14px">Are you sure you want to make a withdrawal?</Body2>
    </Modal>
  );
};
