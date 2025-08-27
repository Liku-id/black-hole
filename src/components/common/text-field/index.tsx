'use client';

import { TextFieldProps, InputAdornment, Box } from '@mui/material';
import { ReactNode } from 'react';
import { Body2 } from '@/components/common';
import { StyledTextField } from './StyledTextField';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  startComponent?: ReactNode;
  endComponent?: ReactNode;
  name?: string;
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
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
    ...otherProps 
  } = props;

  const inputProps = {
    ...InputProps,
    startAdornment: startComponent ? (
      <InputAdornment position="start">
        {startComponent}
      </InputAdornment>
    ) : InputProps?.startAdornment,
    endAdornment: endComponent ? (
      <InputAdornment position="end">
        {endComponent}
      </InputAdornment>
    ) : InputProps?.endAdornment,
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
        variant="outlined"
        InputProps={inputProps}
        error={error}
        helperText={helperText}
        {...otherProps}
      />
    </Box>
  );
};

// Form TextField with React Hook Form integration
const FormTextField = ({ name, rules, ...props }: CustomTextFieldProps) => {
  const { control, formState: { errors } } = useFormContext();
  const fieldError = errors[name as string];
  
  const { 
    label, 
    startComponent, 
    endComponent, 
    InputProps,
    ...otherProps 
  } = props;

  const inputProps = {
    ...InputProps,
    startAdornment: startComponent ? (
      <InputAdornment position="start">
        {startComponent}
      </InputAdornment>
    ) : InputProps?.startAdornment,
    endAdornment: endComponent ? (
      <InputAdornment position="end">
        {endComponent}
      </InputAdornment>
    ) : InputProps?.endAdornment,
  };

  return (
    <Controller
      name={name as string}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Box>
          {label && (
            <Body2 color="text.primary" sx={{ mb: 1, display: 'block' }}>
              {label}
            </Body2>
          )}
          <StyledTextField
            {...field}
            variant="outlined"
            InputProps={inputProps}
            error={!!fieldError}
            helperText={fieldError?.message as string}
            {...otherProps}
          />
        </Box>
      )}
    />
  );
};

export default CustomTextField;
