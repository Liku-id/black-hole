import { Box } from '@mui/material';
import React from 'react';

import { Body2, Button, Modal } from '@/components/common';

interface ResetPasswordModalProps {
  open: boolean;
  onLogin: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onLogin
}) => {
  return (
    <Modal
      height={220}
      open={open}
      title="Reset Password Complete!"
      onClose={onLogin}
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={onLogin}>Login</Button>
        </Box>
      }
    >
      <Body2 color="text.primary">
        Your password has been successfully reset.
      </Body2>
    </Modal>
  );
};

export default ResetPasswordModal;

