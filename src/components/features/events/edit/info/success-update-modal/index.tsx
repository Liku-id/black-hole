import { Box, Modal, IconButton } from '@mui/material';
import Image from 'next/image';

import { Button, H3, Body2 } from '@/components/common';

interface SuccessUpdateModalProps {
  open: boolean;
  onClose: () => void;
  eventStatus: string;
}

export const SuccessUpdateModal = ({
  open,
  onClose,
  eventStatus
}: SuccessUpdateModalProps) => {
  const isOnReview = eventStatus === 'on_review';

  const getTitle = () => {
    return isOnReview ? 'Event is Being Reviewed' : 'Update Request Submitted';
  };

  const getMessage = () => {
    return isOnReview
      ? 'The changes to your event are currently on review by Wukong team. Please check your email regularly for the status updates.'
      : 'Your event update request has been submitted and currently on review by Wukong team. Your event is still live in Wukong. Please check your email regularly for the status updates.';
  };

  if (!['on_review', 'on_going', 'approved'].includes(eventStatus)) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 3,
          width: '445px',
          maxWidth: 600,
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <H3 color="text.primary" fontWeight={700}>
            {getTitle()}
          </H3>
          <IconButton size="small" onClick={onClose}>
            <Image alt="Close" height={20} src="/icon/close.svg" width={20} />
          </IconButton>
        </Box>

        {/* Message */}
        <Box
          sx={{
            backgroundColor: 'primary.light',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 1,
            p: 2,
            mb: 3
          }}
        >
          <Body2 color="text.primary">{getMessage()}</Body2>
        </Box>

        {/* Confirm Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="primary"
            onClick={onClose}
            sx={{
              minWidth: 120
            }}
          >
            Back
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
