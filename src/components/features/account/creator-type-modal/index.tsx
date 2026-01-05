
import { Box, Modal, IconButton, Radio, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Button, H3 } from '@/components/common';

interface CreatorTypeModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: (creatorType: string) => void;
  loading?: boolean;
}

export const CreatorTypeModal = ({
  open,
  onClose,
  onContinue,
  loading = false
}: CreatorTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleContinue = () => {
    if (selectedType) {
      onContinue(selectedType);
    }
  };

  const creatorTypes = [
    {
      value: 'individual',
      label: 'Individual Creator',
      icon: '/icon/individual.svg'
    },
    {
      value: 'institutional',
      label: 'Company Creator',
      icon: '/icon/institutional.svg'
    }
  ];

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
            Choose Creator Type
          </H3>
          <IconButton size="small" onClick={onClose}>
            <Image alt="Close" height={20} src="/icon/close.svg" width={20} />
          </IconButton>
        </Box>

        {/* Creator Type Options */}
        <Box display="flex" gap={3} mb={4}>
          {creatorTypes.map((type) => (
            <Box
              key={type.value}
              sx={{
                flex: 1,
                border: '1px solid',

                borderColor:
                  selectedType === type.value
                    ? 'primary.main'
                    : 'text.secondary',
                padding: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'background.default'
                }
              }}
              onClick={() => setSelectedType(type.value)}
            >
              {/* Radio Button */}
              <Box display="flex" justifyContent="flex-start" mb={2}>
                <Radio
                  checked={selectedType === type.value}
                  onChange={() => setSelectedType(type.value)}
                  sx={{
                    color: 'text.secondary',
                    '&.Mui-checked': {
                      color: 'primary.main'
                    }
                  }}
                />
              </Box>

              {/* Icon */}
              <Box
                display="flex"
                justifyContent="center"
                mb={2}
                sx={{ height: 60 }}
              >
                <Image
                  src={type.icon}
                  alt={type.label}
                  width={48}
                  height={48}
                />
              </Box>

              {/* Label */}
              <Typography
                textAlign="center"
                color="text.primary"
                fontWeight={500}
                fontSize="16px"
              >
                {type.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Continue Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedType || loading}
            sx={{
              minWidth: 120
            }}
          >
            {loading ? 'Updating...' : 'Continue'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
