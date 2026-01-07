import React from 'react';
// Third Party
import { Box } from '@mui/material';
// Components & Layouts
import { Body2, Button, Modal } from '@/components/common';

interface AddTeamMemberModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  open,
  onClose,
  onConfirm,
  onBack,
  loading = false,
  error,
  success = false
}) => {
  // Handle modal close preventing close during loading
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      footer={
        success ? (
          <Box display="flex" justifyContent="flex-end">
            <Button variant="primary" onClick={onBack}>
              Back
            </Button>
          </Box>
        ) : (
          <>
            {error && (
              <Box mb={1} textAlign="right">
                <Body2 color="error.main" fontSize="12px">
                  {error}
                </Body2>
              </Box>
            )}
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button disabled={loading} variant="secondary" onClick={handleClose}>
                Back
              </Button>
              <Button disabled={loading} variant="primary" onClick={onConfirm}>
                Yes, Add Team Member
              </Button>
            </Box>
          </>
        )
      }
      height={error ? 200 : success ? 200 : 180}
      open={open}
      title={success ? "Team Member Created!" : "Add Team Member"}
      onClose={success ? undefined : handleClose}
    >
      <Body2 fontSize="14px">
        {success
          ? <>Please check your <strong>team member email</strong> to get the credentials to enter the Wukong dashboard</>
          : "Are you sure want to add this new team member?"
        }
      </Body2>
    </Modal>
  );
};
