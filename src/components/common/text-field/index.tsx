'use client';

import { ErrorOutline } from '@mui/icons-material';
import { TextFieldProps, InputAdornment, Box } from '@mui/material';
import { ReactNode } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { Body2 } from '@/components/common';

import { StyledTextField } from './StyledTextField';

interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  startComponent?: ReactNode;
  endComponent?: ReactNode;
  name?: string;
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  isRejected?: boolean;
  formatValue?: (value: string) => string;
}

export const CustomTextField = (props: CustomTextFieldProps) => {
  const {
    label,
    startComponent,
    endComponent,
    InputProps,
    name,
    rules,
    error,
    helperText,
    formatValue,
    ...otherProps
  } = props;

  const inputProps = {
    ...InputProps,
    startAdornment: startComponent ? (
      <InputAdornment position="start">{startComponent}</InputAdornment>
    ) : (
      InputProps?.startAdornment
    ),
    endAdornment: endComponent ? (
      <InputAdornment position="end">{endComponent}</InputAdornment>
    ) : (
      InputProps?.endAdornment
    )
  };

  // If name is provided, use React Hook Form
  if (name) {
    return <FormTextField name={name} rules={rules} {...props} />;
  }

  // Regular TextField without form
  return (
    <Box>
      {label && (
        <Body2 color="text.primary" sx={{ mb: 1, display: 'block' }}>
          {label}
        </Body2>
      )}
      <StyledTextField
        error={error}
        helperText={helperText}
        InputProps={inputProps}
        variant="outlined"
        {...otherProps}
      />
    </Box>
  );
};

// Form TextField with React Hook Form integration
const FormTextField = ({
  name,
  rules,
  isRejected,
  formatValue,
  ...props
}: CustomTextFieldProps) => {
  const {
    control,
    formState: { errors }
  } = useFormContext();
  const fieldError = errors[name as string];

  const { label, startComponent, endComponent, InputProps, ...otherProps } =
    props;

  const inputProps = {
    ...InputProps,
    startAdornment: startComponent ? (
      <InputAdornment position="start">{startComponent}</InputAdornment>
    ) : (
      InputProps?.startAdornment
    ),
    endAdornment: endComponent ? (
      <InputAdornment position="end">{endComponent}</InputAdornment>
    ) : (
      InputProps?.endAdornment
    )
  };

  return (
    <Controller
      control={control}
      name={name as string}
      render={({ field }) => (
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
            {...field}
            value={formatValue ? formatValue(field.value || '') : field.value}
            onChange={(e) => {
              const formattedValue = formatValue
                ? formatValue(e.target.value)
                : e.target.value;
              field.onChange(formattedValue);
            }}
            error={!!fieldError}
            helperText={fieldError?.message as string}
            InputProps={inputProps}
            variant="outlined"
            {...otherProps}
          />
        </Box>
      )}
      rules={rules}
    />
  );
};

// Export TextField with formatValue support
export const TextField = CustomTextField;

export default CustomTextField;
