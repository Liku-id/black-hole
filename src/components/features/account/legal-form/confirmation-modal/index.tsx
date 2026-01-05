import { Box, Modal, IconButton, Checkbox } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Button, H3, Body2 } from '@/components/common';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  declaration: string;
  confirmButtonText?: string;
  loading?: boolean;
}

export const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  declaration,
  confirmButtonText = 'Confirm and Save',
  loading = false
}: ConfirmationModalProps) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirm = () => {
    if (isChecked) {
      onConfirm();
    }
  };

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
          position: 'relative'
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
            {title}
          </H3>
          <IconButton size="small" onClick={onClose}>
            <Image alt="Close" height={20} src="/icon/close.svg" width={20} />
          </IconButton>
        </Box>

        {/* Declaration */}
        <Box mb={3}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Checkbox
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              sx={{
                color: 'text.secondary',
                '&.Mui-checked': {
                  color: 'primary.main'
                }
              }}
            />
            <Body2 color="text.primary">{declaration}</Body2>
          </Box>
        </Box>

        {/* Confirm Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!isChecked || loading}
            sx={{
              minWidth: 120
            }}
          >
            {loading ? 'Saving...' : confirmButtonText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
