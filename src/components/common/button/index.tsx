import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary';
}

// Base button with common styles
const BaseButton = styled(Button)<{ customVariant?: 'primary' | 'secondary' }>(({ theme, customVariant = 'primary' }) => ({
  padding: '14px 24px',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  fontFamily: '"Onest", sans-serif',
  lineHeight: 'normal',
  
  // Primary variant (default)
  ...(customVariant === 'primary' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: '#2A3BC7', // Darker shade for hover
    },
    '&:disabled': {
      backgroundColor: theme.palette.action.disabled,
      color: theme.palette.action.disabledBackground,
    },
  }),
  
  // Secondary variant
  ...(customVariant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: 'rgba(60, 80, 224, 0.20)',
      border: `1px solid ${theme.palette.primary.main}`,
    },
    '&:disabled': {
      backgroundColor: 'rgba(60, 80, 224, 0.05)',
      color: theme.palette.action.disabled,
      border: `1px solid ${theme.palette.action.disabled}`,
    },
  }),
}));

export const CustomButton = (props: CustomButtonProps) => {
  const { variant = 'primary', ...otherProps } = props;
  
  return <BaseButton customVariant={variant} {...otherProps} />;
};

export default CustomButton;
