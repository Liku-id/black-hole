import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Shared styled TextField used across text-field, phone-field, date-field
export const StyledTextField = styled(TextField)<TextFieldProps>(
  ({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: '"Onest", sans-serif',
      lineHeight: 'normal',
      backgroundColor: theme.palette.common.white,
      border: `1px solid ${theme.palette.divider}`,

      '& fieldset': {
        border: 'none' // Remove default MUI border
      },

      '&:hover': {
        border: `1px solid ${theme.palette.divider}`
      },

      '&.Mui-focused': {
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${theme.palette.primary.main}`,
        '& fieldset': {
          border: 'none'
        }
      },

      // When input has value (filled state)
      '&:has(input:not(:placeholder-shown))': {
        backgroundColor: theme.palette.background.default,
        border: `1px solid ${theme.palette.primary.main}`
      },

      '& input': {
        padding: '11px 16px',
        color: theme.palette.text.primary,
        '&::placeholder': {
          color: theme.palette.text.secondary,
          opacity: 1
        }
      },

      // TextArea specific styles
      '& textarea': {
        padding: '11px 16px',
        color: theme.palette.text.primary,
        minHeight: '182px',
        resize: 'vertical',
        '&::placeholder': {
          color: theme.palette.text.secondary,
          opacity: 1
        }
      },

      '& .MuiInputAdornment-root': {
        margin: 0
      }
    },

    '& .MuiFormHelperText-root': {
      fontSize: '12px',
      fontFamily: '"Onest", sans-serif',
      lineHeight: 'normal'
    }
  })
);

export default StyledTextField;
