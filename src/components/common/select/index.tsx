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
  fullWidth?: boolean;
}

export const CustomSelect = (props: CustomSelectProps) => {
  const { label, name, rules, options, placeholder, fullWidth, ...otherProps } =
    props;

  const {
    control,
    formState: { errors }
  } = useFormContext();
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

  const handleOptionSelect = (
    value: string,
    onChange: (value: string) => void
  ) => {
    onChange(value);
    handleClose();
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Box>
          {label && (
            <Body2 color="text.primary" display="block" mb={1}>
              {label}
            </Body2>
          )}
          <StyledTextField
            {...field}
            {...otherProps}
            error={!!fieldError}
            fullWidth={fullWidth}
            helperText={fieldError?.message as string}
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
            value={(() => {
              // Display label instead of value
              const selectedOption = options.find(
                (option) => option.value === field.value
              );
              return selectedOption ? selectedOption.label : field.value;
            })()}
            variant="outlined"
            onClick={handleClick}
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
                sx={(theme) => ({
                  py: 1.5,
                  fontSize: '14px',
                  fontFamily: '"Onest", sans-serif',
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.paletteinfo.contrastText
                  },
                  borderBottom: '1px solid',
                  borderColor: theme.palette.divider
                })}
                onClick={() => handleOptionSelect(option.value, field.onChange)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}
      rules={rules}
    />
  );
};

export default CustomSelect;
