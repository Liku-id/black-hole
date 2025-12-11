import { Box } from '@mui/material';
import React from 'react';

import { Body2, Button, Modal, Overline } from '@/components/common';

interface DuplicateEventModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  isSuccess?: boolean;
  error?: string | null;
}

export const DuplicateEventModal: React.FC<DuplicateEventModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  isSuccess = false,
  error
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
        title="Duplicate Event Success!"
        titleSize="22px"
        onClose={onClose}
      >
        <Body2 fontSize="14px">
          Your event have been duplicated. You can check and edit your event on
          draft even tab.
        </Body2>
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
              Back
            </Button>
            <Button disabled={loading} variant="primary" onClick={onConfirm}>
              Yes, Duplicate Event
            </Button>
          </Box>
        </>
      }
      height={error ? 200 : 180}
      open={open}
      title="Duplicate Event"
      onClose={onClose}
    >
      <Body2 fontSize="14px">Are you sure want to duplicate this event?</Body2>
    </Modal>
  );
};
