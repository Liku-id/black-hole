import { useState } from 'react';

import { Box, Modal, IconButton, Radio, Typography } from '@mui/material';
import Image from 'next/image';

import { Button, H3 } from '@/components/common';

interface CreatorTypeModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: (creatorType: string) => void;
}

export const CreatorTypeModal = ({
  open,
  onClose,
  onContinue
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
          borderRadius: 2,
          padding: 3,
          width: '90%',
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
                border:
                  selectedType === type.value
                    ? '2px solid #1976d2'
                    : '1px solid #e0e0e0',
                borderRadius: 2,
                padding: 3,
                cursor: 'pointer',
                backgroundColor:
                  selectedType === type.value ? '#f3f8ff' : 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: '#f3f8ff'
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
                    color: '#1976d2',
                    '&.Mui-checked': {
                      color: '#1976d2'
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
            disabled={!selectedType}
            sx={{
              minWidth: 120
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
