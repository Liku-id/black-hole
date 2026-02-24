'use client';

import { ErrorOutline } from '@mui/icons-material';
import { TextFieldProps, Box } from '@mui/material';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { StyledTextField } from '../text-field/StyledTextField';
import { Body2 } from '../typography';


interface CustomTextAreaProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  name?: string;
  rules?: RegisterOptions;
  error?: boolean;
  maxLength?: number;
  isRejected?: boolean;
  height?: string | number;
}

const getTextAreaStyles = (
  value: unknown,
  theme: any,
  height: string | number = '182px'
) => {
  const hasValue = value && typeof value === 'string' && value.trim() !== '';
  return {
    '& .MuiOutlinedInput-root': {
      height: height,
      alignItems: 'flex-start',
      overflowY: 'auto',
      backgroundColor: hasValue
        ? `${theme.palette.background.default} !important`
        : `${theme.palette.common.white} !important`,
      border: hasValue
        ? `1px solid ${theme.palette.primary.main} !important`
        : `1px solid ${theme.palette.divider} !important`,
      '&.Mui-focused': {
        backgroundColor: `${theme.palette.background.default} !important`,
        border: `1px solid ${theme.palette.primary.main} !important`
      },
      '& textarea': {
        padding: '0px',
        height: '100% !important',
        width: '100% !important',
        resize: 'none',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }
    }
  };
};

export const CustomTextArea = (props: CustomTextAreaProps) => {
  const { label, name, rules, error, maxLength, height, ...otherProps } = props;

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
        inputProps={{ maxLength }}
        rows={4}
        sx={(theme) => getTextAreaStyles(otherProps.value, theme, height)}
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
  isRejected,
  height,
  ...props
}: CustomTextAreaProps) => {
  const {
    control,
    formState: { errors }
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
            multiline
            error={!!fieldError}
            helperText={fieldError?.message as string}
            inputProps={{ maxLength }}
            rows={4}
            sx={(theme) => getTextAreaStyles(field.value, theme, height)}
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
