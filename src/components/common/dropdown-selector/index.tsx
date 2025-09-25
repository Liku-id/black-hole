import { Box, Menu, MenuItem } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Body2 } from '@/components/common';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownSelectorProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  defaultLabel?: string;
  disabled?: boolean;
}

export const DropdownSelector = ({
  selectedValue,
  onValueChange,
  options,
  defaultLabel,
  disabled
}: DropdownSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleValueSelect = (value: string) => {
    onValueChange(value);
    handleClose();
  };

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );
  const displayValue = selectedOption
    ? selectedOption.label
    : defaultLabel || options[0]?.label;

  return (
    <>
      <Box
        alignItems="center"
        component="span"
        display="flex"
        gap={1}
        paddingY={1}
        sx={{ cursor: disabled ? 'default' : 'pointer' }}
        onClick={handleClick}
      >
        <Image
          alt="dropdown"
          height={12}
          src="/icon/accordion-arrow.svg"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
          width={12}
        />
        <Body2 component="span" fontWeight={500}>
          {displayValue}
        </Body2>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        PaperProps={{
          sx: (theme) => ({
            mt: 1,
            minWidth: 80,
            boxShadow: theme.shadows[8],
            borderRadius: 1
          })
        }}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            sx={(theme) => ({
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: theme.palette.primary.light
              }
            })}
            onClick={() => handleValueSelect(option.value)}
          >
            <Body2 component="span">{option.label}</Body2>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DropdownSelector;
