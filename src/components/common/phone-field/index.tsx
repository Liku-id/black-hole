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

import { Body2, Caption } from '@/components/common';

import { StyledTextField } from '../text-field/StyledTextField';

interface CountryCode {
  code: string;
  dialCode: string;
}

const countryCodes: CountryCode[] = [
  { code: 'ID', dialCode: '+62' },
  { code: 'GB', dialCode: '+44' },
  { code: 'SG', dialCode: '+65' },
  { code: 'MY', dialCode: '+60' },
  { code: 'AU', dialCode: '+61' }
];

interface CustomPhoneFieldProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  name: string; // Required for React Hook Form
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  defaultCountryCode?: string;
}

// Country Code Selector Component
const CountryCodeSelector = ({
  selectedCode,
  onCodeChange
}: {
  selectedCode: CountryCode;
  onCodeChange: (code: CountryCode) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCodeSelect = (code: CountryCode) => {
    onCodeChange(code);
    handleClose();
  };

  return (
    <>
      <Box
        alignItems="center"
        component="span"
        display="flex"
        gap={1}
        paddingY={1}
        sx={{ cursor: 'pointer' }}
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
          {selectedCode.dialCode}
        </Body2>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        PaperProps={{
          sx: (theme) => ({
            mt: 1,
            minWidth: 120,
            boxShadow: theme.shadows[8],
            borderRadius: 1
          })
        }}
        onClose={handleClose}
      >
        {countryCodes.map((code) => (
          <MenuItem
            key={code.code}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            })}
            onClick={() => handleCodeSelect(code)}
          >
            <Body2 component="span">{code.dialCode}</Body2>
            <Caption component="span">{code.code}</Caption>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const CustomPhoneField = (props: CustomPhoneFieldProps) => {
  const {
    label,
    name,
    rules,
    error,
    helperText,
    defaultCountryCode = '+62',
    ...otherProps
  } = props;

  const {
    control,
    formState: { errors }
  } = useFormContext();
  const fieldError = errors[name];

  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(
    countryCodes.find((code) => code.dialCode === defaultCountryCode) ||
      countryCodes[0]
  );

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
            error={!!fieldError}
            helperText={fieldError?.message as string}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CountryCodeSelector
                    selectedCode={selectedCountryCode}
                    onCodeChange={setSelectedCountryCode}
                  />
                </InputAdornment>
              )
            }}
            variant="outlined"
            {...otherProps}
          />
        </Box>
      )}
      rules={rules}
    />
  );
};

export default CustomPhoneField;
