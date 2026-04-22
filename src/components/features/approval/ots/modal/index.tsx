import { Box } from '@mui/material';

import { Body2, Button, Modal } from '@/components/common';

interface OTSApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  eventName?: string;
  loading?: boolean;
}

const OTSApprovalModal = ({
  open,
  onClose,
  onApprove,
  onReject,
  eventName,
  loading
}: OTSApprovalModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review OTS Request"
      width={400}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="16px">
          <Button variant="secondary" onClick={onReject} disabled={loading}>
            Reject
          </Button>
          <Button variant="primary" onClick={onApprove} disabled={loading}>
            Yes, Approve
          </Button>
        </Box>
      }
    >
      <Box mb="32px">
        <Body2 color="text.primary" fontSize="14px" fontWeight={400}>
          Please review the On The Spot (OTS) feature request for{' '}
          <strong>{eventName || 'this event'}</strong>. Do you want to approve or reject it?
        </Body2>
      </Box>
    </Modal>
  );
};

export default OTSApprovalModal;
