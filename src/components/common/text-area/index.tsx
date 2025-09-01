'use client';

import { TextFieldProps, Box } from '@mui/material';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { Body2 } from '@/components/common';

import { StyledTextField } from '../text-field/StyledTextField';

interface CustomTextAreaProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  name?: string;
  rules?: RegisterOptions;
  error?: boolean;
  maxLength?: number;
}

export const CustomTextArea = (props: CustomTextAreaProps) => {
  const { label, name, rules, error, maxLength, ...otherProps } = props;

  // If name is provided, use React Hook Form
  if (name) {
    return <FormTextArea name={name} rules={rules} {...props} />;
  }

  // Regular TextArea without form
  return (
    <Box>
      {label && (
        <Body2 color="text.primary" marginBottom="8px">
          {label}
        </Body2>
      )}
      <StyledTextField
        multiline
        error={error}
        inputProps={{
          maxLength: maxLength
        }}
        rows={4}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '182px',
            alignItems: 'flex-start',
            '& textarea': {
              padding: '0px',
              height: '100% !important',
              width: '100% !important',
              resize: 'none'
            }
          }
        }}
        variant="outlined"
        {...otherProps}
      />
    </Box>
  );
};

// Form TextArea with React Hook Form integration
const FormTextArea = ({
  name,
  rules,
  maxLength,
  ...props
}: CustomTextAreaProps) => {
  const {
    control,
    formState: { errors },
    watch
  } = useFormContext();
  const fieldError = errors[name as string];

  const { label, ...otherProps } = props;

  // Add maxLength validation to rules
  const enhancedRules = {
    ...rules,
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: `Maximum ${maxLength} characters allowed`
      }
    })
  };

  return (
    <Controller
      control={control}
      name={name as string}
      render={({ field }) => (
        <Box>
          {label && (
            <Body2 color="text.primary" marginBottom="8px">
              {label}
            </Body2>
          )}
          <StyledTextField
            {...field}
            multiline
            error={!!fieldError}
            helperText={fieldError?.message as string}
            inputProps={{
              maxLength: maxLength
            }}
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '182px',
                alignItems: 'flex-start',
                '& textarea': {
                  padding: '0px !important',
                  height: '100% !important',
                  width: '100% !important',
                  minHeight: 'unset !important',
                  resize: 'none !important'
                }
              }
            }}
            variant="outlined"
            {...otherProps}
          />
        </Box>
      )}
      rules={enhancedRules}
    />
  );
};

export default CustomTextArea;
