import { useAuth } from '@/contexts/AuthContext';
import {
  Alert,
  alpha,
  Box,
  Card,
  CardContent,
  CircularProgress,
  styled,
} from '@mui/material';
import { TextField, Button, H3, Body1 } from '@/components/common';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

const LoginCard = styled(Card)(
  ({ theme }) => `
    width: 100%;
    max-width: 420px;
    padding: ${theme.spacing(3)};
    margin: ${theme.spacing(2)};
    background: ${alpha(theme.palette.background.paper, 0.95)};
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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

export const email = (value: string) =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email format'
    : undefined;

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  const methods = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange'
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
    clearError();
    
    try {
      await login(data);
    } catch (err) {
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
          {/* <Logo /> */}
        </LogoWrapper>
        
        <Box textAlign="center" mb={4}>
          <H3 color="text.primary" gutterBottom>
            Welcome Back
          </H3>
          <Body1 color="text.secondary">
            Please sign in to your account
          </Body1>
        </Box>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Box mb={3}>
              <TextField
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                disabled={isFormDisabled}
                fullWidth
                rules={{
                  required: 'Email is required',
                  validate: email
                }}
              />
            </Box>
            
            <Box mb={3}>
              <TextField
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                disabled={isFormDisabled}
                fullWidth
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                }}
              />
            </Box>

          {error && (
            <Box mb={3}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 8,
                  '& .MuiAlert-message': {
                    fontSize: 14,
                    fontWeight: 500
                  }
                }}
              >
                {error}
              </Alert>
            </Box>
          )}

            <Button
              type="submit"
              disabled={isFormDisabled}
              sx={{ width: '100%', height: '48px' }}
            >
              {isFormDisabled ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </LoginCard>
  );
};

export default LoginForm;
