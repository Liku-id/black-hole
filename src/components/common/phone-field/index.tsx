import { TextFieldProps, InputAdornment, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { Body2, DropdownSelector } from '@/components/common';

import { StyledTextField } from '../text-field/StyledTextField';

interface CountryCode {
  code: string;
  dialCode: string;
}

const countryCodes: CountryCode[] = [{ code: 'ID', dialCode: '+62' }];

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
    setValue,
    setError,
    clearErrors,
    trigger
  } = useFormContext();

  const fieldError = errors[name];
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    defaultCountryCode || '+62'
  );

  // Local state for display value (what user sees)
  const [displayValue, setDisplayValue] = useState<string>('');

  // Handle phone number input change
  const handlePhoneNumberChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;

    // Prevent phone number from starting with 0
    if (inputValue.startsWith('0')) {
      // Set error manually to show user feedback
      setError(name, {
        type: 'manual',
        message: 'Phone number cannot start with 0'
      });
      return; // Don't update the value if it starts with 0
    }

    // Clear any existing errors when user types valid input
    clearErrors(name);

    setDisplayValue(inputValue);

    // Update the form value with country code only if there's input
    const combinedValue = inputValue ? selectedCountryCode + inputValue : '';
    setValue(name, combinedValue);

    // Trigger validation to clear error when user types
    await trigger(name);
  };

  // Initialize the field with empty value
  useEffect(() => {
    if (!displayValue) {
      setValue(name, '');
    }
  }, [setValue, name, displayValue]);

  // Handle country code change
  const handleCountryCodeChange = async (newCountryCode: string) => {
    setSelectedCountryCode(newCountryCode);

    // Update the form value with new country code if there's input
    if (displayValue) {
      const combinedValue = newCountryCode + displayValue;
      setValue(name, combinedValue);
      await trigger(name);
    }
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
                    onValueChange={handleCountryCodeChange}
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
