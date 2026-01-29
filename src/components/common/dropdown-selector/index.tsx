import { Box, Menu, MenuItem, TextField, InputAdornment } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Body2 } from '@/components/common';

interface DropdownOption {
  value: string;
  label: string;
  displayLabel?: string; // Optional: different label for display when selected
  id?: string;
}

interface DropdownSelectorProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  defaultLabel?: string;
  disabled?: boolean;
  id?: string;
  enableSearch?: boolean; // Enable search functionality
}

export const DropdownSelector = ({
  selectedValue,
  onValueChange,
  options,
  defaultLabel,
  disabled,
  id,
  enableSearch = false
}: DropdownSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery(''); // Reset search when closing
  };

  const handleValueSelect = (value: string) => {
    onValueChange(value);
    handleClose();
  };

  // Filter options based on search query
  const filteredOptions = enableSearch && searchQuery
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );
  const displayValue = selectedOption
    ? (selectedOption.displayLabel || selectedOption.label)
    : defaultLabel || options[0]?.label;

  return (
    <>
      <Box
        id={id}
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
            minWidth: enableSearch ? 250 : 80,
            maxHeight: 400,
            boxShadow: theme.shadows[8],
            borderRadius: 1
          })
        }}
        onClose={handleClose}
      >
        {enableSearch && (
          <Box sx={{ px: 2, pt: 1.5, pb: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              autoFocus
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image
                      alt="search"
                      height={16}
                      src="/icon/search.svg"
                      width={16}
                    />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )}
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            <MenuItem
              key={`${option.value}-${option.id || index}`}
              id={option.id}
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
          ))
        ) : (
          <Box sx={{ py: 2, px: 2, textAlign: 'center' }}>
            <Body2 color="text.secondary">No results found</Body2>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default DropdownSelector;
