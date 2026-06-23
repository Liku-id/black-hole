import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';

import {
  Button,
  TextField,
  Body2
} from '@/components/common';
import CustomModal from '@/components/common/modal';

interface EditInvitationLimitModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (limit: number) => Promise<void> | void;
  currentLimit: number;
  loading?: boolean;
}

export const EditInvitationLimitModal = ({
  open,
  onClose,
  onSubmit,
  currentLimit,
  loading
}: EditInvitationLimitModalProps) => {
  const [limitValue, setLimitValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (currentLimit === -1) {
        setLimitValue('');
      } else {
        setLimitValue(currentLimit.toString());
      }
      setError('');
    }
  }, [open, currentLimit]);

  const handleSave = () => {
    const parsed = parseInt(limitValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      setError('Limit must be a positive number greater than or equal to 1');
      return;
    }
    onSubmit(parsed);
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Edit Invitation Limit"
      width={450}
      height="auto"
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Limit Value Input */}
        <Box>
          <Body2 color="text.secondary" mb={1} fontWeight={600}>
            Invitation Limit Quota*
          </Body2>
          <TextField
            type="number"
            placeholder="e.g. 500"
            value={limitValue}
            onChange={(e) => {
              setLimitValue(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            fullWidth
            InputProps={{
              inputProps: { min: 1 }
            }}
          />
        </Box>

        {/* Action Button */}
        <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} sx={{ width: '150px' }}>
            {loading ? 'Saving...' : 'Save Limit'}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default EditInvitationLimitModal;
