import { TextFieldProps, InputAdornment, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { Body2, Caption } from '@/components/common';
import { StyledTextField } from '../text-field/StyledTextField';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';
import Image from 'next/image';

interface CountryCode {
  code: string;
  dialCode: string;
}

const countryCodes: CountryCode[] = [
  { code: 'ID', dialCode: '+62' },
  { code: 'GB', dialCode: '+44' },
  { code: 'SG', dialCode: '+65' },
  { code: 'MY', dialCode: '+60' },
  { code: 'AU', dialCode: '+61' },
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
        component="span"
        onClick={handleClick}
        display="flex"
        alignItems="center"
        gap={1}
        paddingY={1}
        sx={{ cursor: 'pointer'}}
      >
         <Image
          src="/icon/accordion-arrow.svg"
          alt="dropdown"
          width={12}
          height={12}
          style={{ 
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
        <Body2 component="span" fontWeight={500}>
          {selectedCode.dialCode}
        </Body2>
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: (theme) => ({
            mt: 1,
            minWidth: 120,
            boxShadow: theme.shadows[8],
            borderRadius: 1,
          })
        }}
      >
        {countryCodes.map((code) => (
          <MenuItem
            key={code.code}
            onClick={() => handleCodeSelect(code)}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            })}
          >
            <Body2 component="span">
              {code.dialCode}
            </Body2>
            <Caption component="span">
              {code.code}
            </Caption>
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

  const { control, formState: { errors } } = useFormContext();
  const fieldError = errors[name];
  
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(
    countryCodes.find(code => code.dialCode === defaultCountryCode) || countryCodes[0]
  );

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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CountryCodeSelector
                    selectedCode={selectedCountryCode}
                    onCodeChange={setSelectedCountryCode}
                  />
                </InputAdornment>
              ),
            }}
            {...otherProps}
          />
        </Box>
      )}
    />
  );
};

export default CustomPhoneField;
