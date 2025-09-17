import { Box } from '@mui/material';

import { Body2, Button } from '@/components/common';
import Modal from '@/components/common/modal';

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName?: string;
  loading?: boolean;
  error?: string | null;
}

export const ApprovalModal = ({
  open,
  onClose,
  onConfirm,
  eventName,
  loading = false,
  error
}: ApprovalModalProps) => {
  return (
    <Modal
      footer={
        <Box display="flex" flexDirection="column" gap={1}>
          {error ? <Body2 color="error.main">{error}</Body2> : null}
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button disabled={loading} variant="secondary" onClick={onClose}>
              No
            </Button>
            <Button disabled={loading} onClick={onConfirm}>
              Yes
            </Button>
          </Box>
        </Box>
      }
      height={error ? 280 : 240}
      open={open}
      title="Approve Event Submission"
      width={520}
      onClose={onClose}
    >
      <Body2 color="text.secondary">
        Are you sure you want to approve the event "{eventName || 'this event'}
        "?
      </Body2>
    </Modal>
  );
};
