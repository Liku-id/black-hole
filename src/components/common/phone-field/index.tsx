import { TextFieldProps, InputAdornment, Box } from '@mui/material';
import { useState } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { Body2, DropdownSelector } from '@/components/common';

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

// Convert to DropdownSelector format
const countryCodeOptions = countryCodes.map((code) => ({
  value: code.dialCode,
  label: code.dialCode
}));

interface CustomPhoneFieldProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  name: string; // Required for React Hook Form
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  defaultCountryCode?: string;
}

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

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    defaultCountryCode || '+62'
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
                  <DropdownSelector
                    defaultLabel="+62"
                    options={countryCodeOptions}
                    selectedValue={selectedCountryCode}
                    onValueChange={setSelectedCountryCode}
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
