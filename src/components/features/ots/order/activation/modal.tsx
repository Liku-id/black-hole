import { Box } from '@mui/material';

import { Body2, Button, Modal } from '@/components/common';

interface ActivateModalProps {
  open: boolean;
  onClose: () => void;
  onActivate: () => void;
  loading?: boolean;
}

export function ActivateModal({ open, onClose, onActivate, loading }: ActivateModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Active OTS"
      titleSize="22px"
      height={180}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="16px">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Back
          </Button>
          <Button variant="primary" onClick={onActivate} disabled={loading}>
            Yes, Activate
          </Button>
        </Box>
      }
    >
      <Box mb="32px">
        <Body2 color="text.primary" fontSize="14px" fontWeight={400}>
          Do you want to activate OTS (On The Spot) feature?
        </Body2>
      </Box>
    </Modal>
  );
}
