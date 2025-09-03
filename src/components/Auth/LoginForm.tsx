import {
  Alert,
  alpha,
  Box,
  Card,
  CardContent,
  CircularProgress,
  styled
} from '@mui/material';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Image from 'next/image';

import { TextField, Button, H2, Body2, Caption } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';

const LoginCard = styled(Card)(
  ({ theme }) => `
    width: 100%;
    max-width: 420px;
    padding: 56px 24px;
    margin: auto;
    background: ${alpha(theme.palette.background.paper, 1)};
    backdrop-filter: blur(10px);
    border-radius: 0px;
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
    <Box>
      <LogoWrapper>
        <Image
          alt="Wukong Logo"
          height={48}
          src="/logo/wukong.svg"
          width={176}
        />
      </LogoWrapper>

      <LoginCard elevation={6}>
        <CardContent sx={{ p: 0, pb: '0px !important' }}>
          <Box mb={5} textAlign={'center'}>
            <H2 gutterBottom color="text.primary" fontWeight={700}>
              Welcome Back,
            </H2>
            <Body2 color="text.secondary">Please sign in to your account</Body2>
          </Box>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Box mb={3}>
                <TextField
                  fullWidth
                  disabled={isFormDisabled}
                  label="Email Address"
                  name="email"
                  placeholder="Email Address"
                  rules={{
                    required: 'Email is required',
                    validate: email
                  }}
                  type="email"
                />
              </Box>

              <Box mb={3}>
                <TextField
                  fullWidth
                  disabled={isFormDisabled}
                  label="Password"
                  name="password"
                  placeholder="Password"
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  }}
                  type="password"
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
                disabled={isFormDisabled}
                sx={{ width: '100%', height: '48px' }}
                type="submit"
              >
                {isFormDisabled ? (
                  <>
                    <CircularProgress
                      color="inherit"
                      size={20}
                      sx={{ mr: 1 }}
                    />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </FormProvider>

          <Box
            mt={5}
            textAlign={'center'}
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            gap={1}
          >
            <Caption color="text.primary">Need an account?</Caption>
            <Caption
              color="info.contrastText"
              sx={{ cursor: 'pointer' }}
              onClick={() => (window.location.href = '/register')}
            >
              Sign up
            </Caption>
          </Box>
        </CardContent>
      </LoginCard>
    </Box>
  );
};

export default LoginForm;
