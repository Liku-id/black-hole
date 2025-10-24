import {
  TextFieldProps,
  InputAdornment,
  Box,
  Menu,
  MenuItem
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { Body2 } from '@/components/common';

import { StyledTextField } from '../text-field/StyledTextField';
import { ErrorOutline } from '@mui/icons-material';

interface SelectOption {
  value: any;
  label: string;
  icon?: string;
}

interface CustomSelectProps
  extends Omit<TextFieldProps, 'variant' | 'onChange'> {
  label?: string;
  name?: string; // Optional - if provided, use React Hook Form
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  isRejected?: boolean;
}

export const CustomSelect = (props: CustomSelectProps) => {
  const { name, rules, ...otherProps } = props;

  // If name is provided, use React Hook Form
  if (name) {
    return <FormSelect name={name} rules={rules} {...otherProps} />;
  }

  // Regular Select without form
  return <SimpleSelect {...otherProps} />;
};

// Simple Select without React Hook Form
const SimpleSelect = (props: CustomSelectProps) => {
  const {
    label,
    options,
    placeholder,
    fullWidth,
    value = '',
    onChange,
    error,
    helperText,
    isRejected,
    ...otherProps
  } = props;

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

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    handleClose();
  };

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  return (
    <Box>
      {label && (
        <Body2
          color="text.primary"
          sx={{
            mb: 1,
            display: isRejected ? 'flex' : 'block',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          {label}{' '}
          {isRejected && <ErrorOutline fontSize="small" color="error" />}
        </Body2>
      )}
      <StyledTextField
        error={error}
        fullWidth={fullWidth}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Box
                alignItems="center"
                component="span"
                display="flex"
                paddingY={1}
                sx={{ cursor: 'pointer' }}
              >
                <Image
                  alt="dropdown"
                  height={16}
                  src="/icon/accordion-arrow.svg"
                  style={{
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                  width={16}
                />
              </Box>
            </InputAdornment>
          )
        }}
        placeholder={placeholder}
        sx={{ cursor: 'pointer' }}
        value={displayValue}
        variant="outlined"
        onClick={handleClick}
        {...otherProps}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        PaperProps={{
          sx: (theme) => ({
            mt: 1,
            width: anchorEl ? anchorEl.offsetWidth : 'auto',
            minWidth: '200px',
            boxShadow: theme.shadows[8],
            borderRadius: 1,
            px: 2
          })
        }}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === value}
            sx={(theme) => ({
              py: 1.5,
              fontSize: '14px',
              fontFamily: '"Onest", sans-serif',
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.light
              },
              borderBottom: '1px solid',
              borderColor: theme.palette.divider,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            })}
            onClick={() => handleSelect(option.value)}
          >
            {option.icon && (
              <Image
                alt={option.label}
                height={24}
                src={option.icon}
                width={24}
              />
            )}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

// Form Select with React Hook Form integration
const FormSelect = (props: CustomSelectProps) => {
  const { name, rules, ...otherProps } = props;

  const {
    control,
    formState: { errors }
  } = useFormContext();
  const fieldError = errors[name as string];

  return (
    <Controller
      control={control}
      name={name as string}
      render={({ field }) => (
        <SimpleSelect
          {...otherProps}
          error={!!fieldError}
          helperText={fieldError?.message as string}
          value={field.value}
          onChange={field.onChange}
        />
      )}
      rules={rules}
    />
  );
};

export default CustomSelect;
