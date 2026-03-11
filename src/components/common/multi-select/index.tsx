import { ErrorOutline } from '@mui/icons-material';
import {
  TextFieldProps,
  InputAdornment,
  Box,
  Menu,
  MenuItem
} from '@mui/material';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';


import { Checkbox } from '../checkbox';
import { StyledTextField } from '../text-field/StyledTextField';
import { Body2 } from '../typography';

interface SelectOption {
  value: any;
  label: string;
}

interface CustomMultiSelectProps
  extends Omit<TextFieldProps, 'variant' | 'onChange' | 'value'> {
  label?: string;
  name?: string; // Optional - if provided, use React Hook Form
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  value?: string[];
  onChange?: (value: string[]) => void;
  isRejected?: boolean;
}

export const MultiSelect = (props: CustomMultiSelectProps) => {
  const { name, rules, ...otherProps } = props;

  // If name is provided, use React Hook Form
  if (name) {
    return <FormMultiSelect name={name} rules={rules} {...otherProps} />;
  }

  // Regular MultiSelect without form
  return <SimpleMultiSelect {...otherProps} />;
};

// Simple MultiSelect without React Hook Form
const SimpleMultiSelect = (props: CustomMultiSelectProps) => {
  const {
    label,
    options,
    placeholder,
    fullWidth,
    value = [],
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
    const currentIndex = value.indexOf(optionValue);
    const newChecked = [...value];

    if (currentIndex === -1) {
      newChecked.push(optionValue);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    onChange?.(newChecked);
  };

  const displayValue = useMemo(() => {
    if (value.length === 0) return '';

    // Find labels for selected values
    const selectedLabels = value.map((val) => {
      const option = options.find((opt) => opt.value === val);
      return option ? option.label : val;
    });

    return selectedLabels.join(', ');
  }, [value, options]);

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
        disableScrollLock
        open={open}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          sx: (theme) => ({
            mt: 1,
            minWidth: anchorEl ? `${anchorEl.offsetWidth}px` : '200px',
            maxWidth: '400px', // Prevent excessively wide menus
            maxHeight: '300px', // Limit height for many options
            boxShadow: theme.shadows[8],
            borderRadius: 1,
            px: 0 // Remove default padding to match design
          })
        }}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            sx={(theme) => ({
              py: 1,
              px: 2,
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
              gap: 1
            })}
            onClick={() => handleSelect(option.value)}
          >
            <Checkbox
              checked={value.indexOf(option.value) > -1}
              size="small"
              sx={{
                padding: 0,
                mr: 1,
                '&.Mui-checked': {
                  color: 'primary.main'
                }
              }}
            />
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

// Form MultiSelect with React Hook Form integration
const FormMultiSelect = (props: CustomMultiSelectProps) => {
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
        <SimpleMultiSelect
          {...otherProps}
          error={!!fieldError}
          helperText={fieldError?.message as string}
          value={field.value || []}
          onChange={field.onChange}
        />
      )}
      rules={rules}
    />
  );
};

export default MultiSelect;
