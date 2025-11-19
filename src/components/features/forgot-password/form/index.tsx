import { alpha, Box, Card, CardContent, styled } from '@mui/material';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Image from 'next/image';

import {
  TextField,
  Button,
  H3,
  Body2,
  Caption,
} from '@/components/common';
import { useToast } from '@/contexts/ToastContext';
import { validationUtils } from '@/utils/validationUtils';

const ForgotPasswordCard = styled(Card)(
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

export interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit: onFormSubmit
}) => {
  const { showError } = useToast();

  const methods = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    },
    mode: 'onChange'
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting }
  } = methods;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await onFormSubmit(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Password reset request failed';
      showError(errorMessage);
    }
  };

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

      <ForgotPasswordCard elevation={6}>
        <CardContent sx={{ p: 0, pb: '0px !important' }}>
          <Box mb={7} textAlign={'center'}>
            <H3 gutterBottom color="text.primary" fontWeight={700}>
              Forgot Your Password,
            </H3>
            <Body2 color="text.secondary">
              Please insert your email address to recover your password
            </Body2>
          </Box>

          <Box m="0 16px">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>

                <Box mb={6}>
                  <TextField
                    id="email_field"
                    fullWidth
                    label="Email address"
                    name="email"
                    placeholder="Email address"
                    rules={{
                      required: 'Email is required',
                      validate: validationUtils.emailValidator
                    }}
                    type="email"
                  />
                </Box>

                <Button
                  id="btn_send_link"
                  disabled={isFormDisabled}
                  fullWidth
                  sx={{
                    height: '48px',
                  }}
                  type="submit"
                >
                  {isSubmitting ? 'Loading...' : 'Send Link'}
                </Button>
              </form>
            </FormProvider>
          </Box>
          <Box
            mt={7}
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
      </ForgotPasswordCard>
    </Box>
  );
};

export default ForgotPasswordForm;
