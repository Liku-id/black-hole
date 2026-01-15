import { Box } from '@mui/material';
import React from 'react';

// Third Party
// Components & Layouts
import { Body2, Button, Modal, Overline } from '@/components/common';

interface DeleteTeamMemberModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

export const DeleteTeamMemberModal: React.FC<DeleteTeamMemberModalProps> = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  error,
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
              Yes, Delete
            </Button>
          </Box>
        </>
      }
      height={error ? 200 : 180}
      open={open}
      title="Delete Team Member"
      onClose={onClose}
    >
      <Body2 fontSize="14px">Are you sure want to delete this new team member?</Body2>
    </Modal>
  );
};
