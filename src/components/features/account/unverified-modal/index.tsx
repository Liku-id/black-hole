import { Box } from '@mui/material';

import { Body2, Button } from '@/components/common';
import CustomModal from '@/components/common/modal';

interface UnverifiedModalProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const UnverifiedModal = ({
  open,
  onClose,
  onProceed
}: UnverifiedModalProps) => {
  const footer = (
    <Box display="flex" justifyContent="flex-end" gap={2}>
      <Button id="back_button" variant="secondary" onClick={onClose}>
        Back
      </Button>
      <Button id="proceed_button" variant="primary" onClick={onProceed}>
        Proceed
      </Button>
    </Box>
  );

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Account Unverified"
      footer={footer}
      width={443}
      height={200}
    >
      <Body2 color="text.primary" fontSize="14px">
        This creator is unverified. Do you want to complete the verification step
        for this creator?
      </Body2>
    </CustomModal>
  );
};

