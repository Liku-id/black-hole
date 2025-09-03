import {
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

import {
  TextField,
  Button,
  H2,
  Body2,
  Caption,
  PhoneField
} from '@/components/common';

const RegisterCard = styled(Card)(
  ({ theme }) => `
    width: 100%;
    max-width: 500px;
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

export const password = (value: string) => {
  if (!value) return undefined;
  if (value.length < 8 || value.length > 20) {
    return 'Password must be 8-20 characters';
  }
  if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(value)) {
    return 'Password must contain letter, number, and special character';
  }
  return undefined;
};

interface RegisterFormData {
  organizerName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit: onFormSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const methods = useForm<RegisterFormData>({
    defaultValues: {
      organizerName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Call the parent onSubmit to move to next step
      onFormSubmit(data);
    } catch (err) {
      console.error('Registration error:', err);
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting;

  return (
    <Box>
      <LogoWrapper>
        <Image
          alt="Wukong Creator Logo"
          height={48}
          src="/logo/wukong.svg"
          width={176}
        />
      </LogoWrapper>

      <RegisterCard elevation={6}>
        <CardContent sx={{ p: 0, pb: '0px !important' }}>
          <Box mb={5} textAlign={'center'}>
            <H2 gutterBottom color="text.primary" fontWeight={700}>
              Welcome,
            </H2>
            <Body2 color="text.secondary">
              Ready to take your events to the next level? Join our platform
              now!
            </Body2>
          </Box>

          <Box m={'0 16px'}>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <Box mb={3}>
                  <TextField
                    fullWidth
                    disabled={isFormDisabled}
                    label="Organizer Name"
                    name="organizerName"
                    placeholder="Organizer Name"
                    rules={{
                      required: 'Organizer name is required'
                    }}
                  />
                </Box>

                <Box mb={3}>
                  <TextField
                    fullWidth
                    disabled={isFormDisabled}
                    label="Email address"
                    name="email"
                    placeholder="Email address"
                    rules={{
                      required: 'Email is required',
                      validate: email
                    }}
                    type="email"
                  />
                </Box>

                <Box mb={3}>
                  <PhoneField
                    fullWidth
                    disabled={isFormDisabled}
                    label="Phone Number"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    rules={{
                      required: 'Phone number is required'
                    }}
                    defaultCountryCode="+62"
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
                      validate: password
                    }}
                    type={showPassword ? 'text' : 'password'}
                    helperText="8-20 characters, letter, number, special character"
                    InputProps={{
                      endAdornment: (
                        <Box
                          component="span"
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            mr: 1
                          }}
                        >
                          <Image
                            alt="Toggle password visibility"
                            height={20}
                            src={
                              showPassword ? '/icon/eye.svg' : '/icon/eye.svg'
                            }
                            width={20}
                          />
                        </Box>
                      )
                    }}
                  />
                </Box>

                <Box mb={3}>
                  <TextField
                    fullWidth
                    disabled={isSubmitting}
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    rules={{
                      required: 'Please confirm your password',
                      validate: (value) => {
                        const password = methods.getValues('password');
                        return value === password || 'Passwords do not match';
                      }
                    }}
                    type={showConfirmPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <Box
                          component="span"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            mr: 1
                          }}
                        >
                          <Image
                            alt="Toggle password visibility"
                            height={20}
                            src={
                              showConfirmPassword
                                ? '/icon/eye.svg'
                                : '/icon/eye.svg'
                            }
                            width={20}
                          />
                        </Box>
                      )
                    }}
                  />
                </Box>

                <Button
                  disabled={isFormDisabled}
                  sx={{
                    width: '322px',
                    height: '48px',
                    margin: '0 auto',
                    display: 'block'
                  }}
                  type="submit"
                >
                  {isFormDisabled ? (
                    <>
                      <CircularProgress
                        color="inherit"
                        size={20}
                        sx={{ mr: 1 }}
                      />
                      Creating Account...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>
            </FormProvider>
          </Box>
          <Box
            mt={5}
            textAlign={'center'}
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            gap={1}
          >
            <Caption color="text.primary">Already have an account?</Caption>
            <Caption
              color="info.contrastText"
              sx={{ cursor: 'pointer' }}
              onClick={() => (window.location.href = '/login')}
            >
              Sign In
            </Caption>
          </Box>
        </CardContent>
      </RegisterCard>
    </Box>
  );
};

export default RegisterForm;
