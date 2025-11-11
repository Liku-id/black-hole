import { alpha, Box, Card, CardContent, styled } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  Body2,
  Button,
  Caption,
  H3,
  TextField
} from '@/components/common';
import { validationUtils } from '@/utils/validationUtils';

const ResetPasswordCard = styled(Card)(
  ({ theme }) => `
    width: 100%;
    max-width: 464px;
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
    margin-bottom: ${theme.spacing(4)};
`
);

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit }) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const methods = useForm<ResetPasswordFormData>({
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
    getValues
  } = methods;

  const isFormDisabled = isSubmitting || !isValid;

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

      <ResetPasswordCard elevation={6}>
        <CardContent sx={{ p: 0, pb: '0px !important' }}>
          <Box mb={7} textAlign="center">
            <H3 color="text.primary" fontWeight={700} mb={2}>
              Welcome Back,
            </H3>
            <Body2 color="text.secondary">
            Create your new password below 
            </Body2>
          </Box>

          <Box m="0 16px">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box mb={3}>
                  <TextField
                    id="new_password_field"
                    fullWidth
                    disabled={isSubmitting}
                    label="New Password"
                    name="newPassword"
                    placeholder="8-20 characters, letter, number, special character"
                    rules={{
                      required: 'New password is required',
                      validate: validationUtils.passwordValidator
                    }}
                    type={showNewPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <Box
                          alignItems="center"
                          component="span"
                          display="flex"
                          mr={1}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <Image
                            alt="Toggle password visibility"
                            height={20}
                            src={
                              showNewPassword
                                ? '/icon/eye.svg'
                                : '/icon/eye-close.svg'
                            }
                            width={20}
                          />
                        </Box>
                      )
                    }}
                  />
                </Box>

                <Box mb={6}>
                  <TextField
                    id="confirm_password_field"
                    fullWidth
                    disabled={isSubmitting}
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    rules={{
                      required: 'Please confirm your password',
                      validate: (value) =>
                        validationUtils.confirmPasswordValidator(
                          value,
                          getValues('newPassword')
                        )
                    }}
                    type={showConfirmPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <Box
                          alignItems="center"
                          component="span"
                          display="flex"
                          mr={1}
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          sx={{ cursor: 'pointer' }}
                        >
                          <Image
                            alt="Toggle password visibility"
                            height={20}
                            src={
                              showConfirmPassword
                                ? '/icon/eye.svg'
                                : '/icon/eye-close.svg'
                            }
                            width={20}
                          />
                        </Box>
                      )
                    }}
                  />
                </Box>

                <Button
                  id="btn_reset_password"
                  disabled={isFormDisabled}
                  fullWidth
                  sx={{ height: '48px' }}
                  type="submit"
                >
                  {isSubmitting ? 'Loading...' : 'Reset Password'}
                </Button>
              </form>
            </FormProvider>
          </Box>

          <Box
            alignItems="center"
            display="flex"
            flexDirection="row"
            gap={1}
            justifyContent="center"
            mt={7}
            textAlign="center"
          >
            <Caption color="text.primary">Need an account?</Caption>
            <Caption
              color="info.contrastText"
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                window.location.href = '/register';
              }}
            >
              Sign up
            </Caption>
          </Box>
        </CardContent>
      </ResetPasswordCard>
    </Box>
  );
};

export default ResetPasswordForm;

