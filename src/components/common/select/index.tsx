import { TextFieldProps, InputAdornment, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { Body2 } from '@/components/common';
import { StyledTextField } from '../text-field/StyledTextField';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';
import Image from 'next/image';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  name: string; // Required for React Hook Form
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const CustomSelect = (props: CustomSelectProps) => {
  const { 
    label, 
    name,
    rules,
    options,
    placeholder,
  } = props;

  const { control, formState: { errors } } = useFormContext();
  const fieldError = errors[name];
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = (value: string, onChange: (value: string) => void) => {
    onChange(value);
    handleClose();
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Box>
          {label && (
            <Body2 color="text.primary" mb={1} display="block">
              {label}
            </Body2>
          )}
          <StyledTextField
            {...field}
            variant="outlined"
            error={!!fieldError}
            helperText={fieldError?.message as string}
            placeholder={placeholder}
            onClick={handleClick}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Box
                    component="span"
                    display="flex"
                    alignItems="center"
                    paddingY={1}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Image
                      src="/icon/accordion-arrow.svg"
                      alt="dropdown"
                      width={16}
                      height={16}
                      style={{ 
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{ cursor: 'pointer' }}
          />
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: (theme) => ({
                mt: 1,
                width: anchorEl ? anchorEl.offsetWidth : 'auto',
                minWidth: '200px',
                boxShadow: theme.shadows[8],
                borderRadius: 1,
                px: 2,
              })
            }}
          >
            {options.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleOptionSelect(option.value, field.onChange)}
                sx={(theme) => ({
                  py: 1.5,
                  fontSize: '14px',
                  fontFamily: '"Onest", sans-serif',
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  borderBottom: '1px solid',
                  borderColor: theme.palette.divider,
                })}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}
    />
  );
};

export default CustomSelect;
