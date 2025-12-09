import { Box } from '@mui/material';
import React from 'react';

import { Body2, Button, Modal, Overline } from '@/components/common';

interface DeleteEventModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  isSuccess?: boolean;
  error?: string | null;
  eventName?: string;
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  isSuccess = false,
  error,
  eventName
}) => {
  if (isSuccess) {
    return (
      <Modal
        footer={
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button variant="primary" onClick={onClose}>
              Okay
            </Button>
          </Box>
        }
        height={180}
        open={open}
        title="Delete Event Success!"
        titleSize="22px"
        onClose={onClose}
      >
        <Body2 fontSize="14px">Your event has been deleted successfully.</Body2>
      </Modal>
    );
  }

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
              Cancel
            </Button>
            <Button disabled={loading} variant="primary" onClick={onConfirm}>
              Yes, Delete Event
            </Button>
          </Box>
        </>
      }
      height={error ? 200 : 180}
      open={open}
      title="Delete Event"
      onClose={onClose}
    >
      <Body2 fontSize="14px">Are you sure you want to delete this event?</Body2>
      <Body2 fontSize="14px" fontWeight={700}>{eventName}</Body2>
    </Modal>
  );
};
