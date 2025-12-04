import { Box } from '@mui/material';
import React from 'react';

import { Body2, Button, Modal } from '@/components/common';

interface PreviewEventModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PreviewEventModal: React.FC<PreviewEventModalProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  return (
    <Modal
      footer={
        <Box display="flex" gap={1} justifyContent="flex-end">
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Yes, Preview
          </Button>
        </Box>
      }
      height={180}
      open={open}
      title="Preview Event"
      onClose={onClose}
    >
      <Body2 fontSize="14px">
        Are you sure want to preview this event in new tab?
      </Body2>
    </Modal>
  );
};

