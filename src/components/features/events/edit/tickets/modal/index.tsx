import { Box } from '@mui/material';
import { useRouter } from 'next/router';

import { Body2, Button as CustomButton, Modal as CustomModal } from '@/components/common';

interface TicketAdditionalFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TicketAdditionalFormModal({
  open,
  onClose,
}: TicketAdditionalFormModalProps) {
  const router = useRouter();
  const { metaUrl } = router.query;

  const handleNoAdditionalForm = () => {
    router.push(`/events/${metaUrl}`);
  };

  const handleAddAdditionalForm = () => {
    router.push(`/events/edit/${metaUrl}/tickets/additional-form`);
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Add Additional Form?"
      width={500}
      height={280}
      footer={
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <CustomButton
            variant="secondary"
            onClick={handleNoAdditionalForm}
          >
            No, I don't need it
          </CustomButton>
          <CustomButton
            variant="primary"
            onClick={handleAddAdditionalForm}
          >
            Yes, add additional form
          </CustomButton>
        </Box>
      }
    >
      <Body2 color="text.secondary">
        You can create additional forms to collect specific information from ticket buyers, such as dietary requirements, emergency contacts, or special requests.
      </Body2>
    </CustomModal>
  );
}
