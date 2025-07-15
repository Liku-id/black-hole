import Logo from '@/components/LogoSign';
import { useAuth } from '@/contexts/AuthContext';
import { isValidForm, validateLoginForm } from '@/utils/validation';
import {
    Alert,
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    styled,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import React, { useState } from 'react';

const LoginCard = styled(Card)(
  ({ theme }) => `
    width: 100%;
    max-width: 420px;
    padding: ${theme.spacing(3)};
    margin: ${theme.spacing(2)};
    background: ${alpha(theme.colors.alpha.white[100], 0.95)};
    backdrop-filter: blur(10px);
    border-radius: ${theme.general.borderRadiusLg};
    box-shadow: ${theme.colors.shadows.primary};
`
);

const LogoWrapper = styled(Box)(
  ({ theme }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${theme.spacing(3)};
`
);

const LoginButton = styled(Button)(
  ({ theme }) => `
    background: ${theme.colors.gradients.blue1};
    color: ${theme.palette.primary.contrastText};
    border: none;
    border-radius: ${theme.general.borderRadiusLg};
    height: 48px;
    font-weight: ${theme.typography.fontWeightBold};
    font-size: ${theme.typography.pxToRem(16)};
    
    &:hover {
      background: ${theme.colors.gradients.blue2};
      transform: translateY(-1px);
      box-shadow: ${theme.colors.shadows.primary};
    }
    
    &:disabled {
      background: ${theme.colors.alpha.black[30]};
      color: ${theme.colors.alpha.black[50]};
      transform: none;
      box-shadow: none;
    }
`
);

const StyledTextField = styled(TextField)(
  ({ theme }) => `
    .MuiOutlinedInput-root {
      border-radius: ${theme.general.borderRadius};
      background: ${theme.colors.alpha.white[100]};
      
      &:hover .MuiOutlinedInput-notchedOutline {
        border-color: ${theme.colors.primary.light};
      }
      
      &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: ${theme.colors.primary.main};
        border-width: 2px;
      }
      
      &.Mui-error .MuiOutlinedInput-notchedOutline {
        border-color: ${theme.colors.error.main};
      }
    }
    
    .MuiInputLabel-root {
      font-weight: ${theme.typography.fontWeightMedium};
      
      &.Mui-focused {
        color: ${theme.colors.primary.main};
      }
    }
  `
);

const LoginForm: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || isLoading) return;
    
    // Validate form
    const errors = validateLoginForm(formData.email, formData.password);
    setValidationErrors(errors);
    
    if (!isValidForm(errors)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(formData);
    } catch (err) {
      // Error is handled in the context
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || isLoading;

  return (
    <LoginCard elevation={6}>
      <CardContent sx={{ p: 0 }}>
        <LogoWrapper>
          <Logo />
        </LogoWrapper>
        
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: theme.typography.fontWeightBold,
              color: theme.colors.alpha.black[100]
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              fontSize: theme.typography.pxToRem(16),
              fontWeight: theme.typography.fontWeightMedium
            }}
          >
            Please sign in to your account
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box mb={3}>
            <StyledTextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              required
              disabled={isFormDisabled}
              autoComplete="email"
              placeholder="Enter your email address"
              variant="outlined"
            />
          </Box>
          
          <Box mb={3}>
            <StyledTextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              required
              disabled={isFormDisabled}
              autoComplete="current-password"
              placeholder="Enter your password"
              variant="outlined"
            />
          </Box>

          {error && (
            <Box mb={3}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: theme.general.borderRadius,
                  '& .MuiAlert-message': {
                    fontSize: theme.typography.pxToRem(14),
                    fontWeight: theme.typography.fontWeightMedium
                  }
                }}
              >
                {error}
              </Alert>
            </Box>
          )}

          <LoginButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isFormDisabled}
            startIcon={isFormDisabled ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isFormDisabled ? 'Signing In...' : 'Sign In'}
          </LoginButton>
        </Box>
      </CardContent>
    </LoginCard>
  );
};

export default LoginForm;
