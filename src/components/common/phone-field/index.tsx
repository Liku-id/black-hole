import { TextFieldProps, InputAdornment, Box } from '@mui/material';
import { useState, useEffect } from 'react';
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
    formState: { errors },
    setValue
  } = useFormContext();

  const fieldError = errors[name];
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    defaultCountryCode || '+62'
  );

  // Local state for display value (what user sees)
  const [displayValue, setDisplayValue] = useState<string>('');

  // Handle country code change
  const handleCountryCodeChange = (newCountryCode: string) => {
    setSelectedCountryCode(newCountryCode);
    // Update the form value with new country code only if there's input
    const combinedValue = displayValue ? newCountryCode + displayValue : '';
    setValue(name, combinedValue);
  };

  // Handle phone number input change
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Update the form value with country code only if there's input
    const combinedValue = inputValue ? selectedCountryCode + inputValue : '';
    setValue(name, combinedValue);
  };

  // Initialize the field with empty value
  useEffect(() => {
    if (!displayValue) {
      setValue(name, '');
    }
  }, [setValue, name, displayValue]);

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
            value={displayValue}
            error={!!fieldError}
            helperText={fieldError?.message as string}
            onChange={handlePhoneNumberChange}
            placeholder="Phone number"
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
