import { Box } from '@mui/material';
import React from 'react';

import { Body2, Button, Caption, Modal } from '@/components/common';

interface ForgotPasswordModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onResend: () => Promise<void>;
  isResending: boolean;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  email,
  onClose,
  onResend,
  isResending
}) => {
  return (
    <Modal
      footer={
        <Box textAlign="right">
          <Button
            disabled={isResending}
            onClick={() => {
              void onResend();
            }}
          >
            {isResending ? 'Resending...' : 'Resend Link'}
          </Button>
        </Box>
      }
      height={229}
      open={open}
      title="Email is Send!"
      onClose={onClose}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <Body2 color="text.primary">
          A message is sent to email {email}. Please check your inbox for reset
          password instruction.
        </Body2>
        <Caption>Didn&apos;t get the message?</Caption>
      </Box>
    </Modal>
  );
};

export default ForgotPasswordModal;

