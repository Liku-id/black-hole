import { Box, Container } from '@mui/material';
import Head from 'next/head';
import { useCallback, useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import ForgotPasswordForm, {
  ForgotPasswordFormData
} from '@/components/features/forgot-password/form';
import ForgotPasswordModal from '@/components/features/forgot-password/modal';
import { useToast } from '@/contexts/ToastContext';
import { forgotPasswordService } from '@/services';
import { registerService } from '@/services/auth/register';

function ForgotPassword() {
  const { showError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = useCallback(
    async ({ email }: ForgotPasswordFormData) => {
      const availabilityResponse = await registerService.checkAvailability({
        email,
      });

      if (availabilityResponse.body.isValid) {
        throw new Error('This email is not registered');
      }

      await forgotPasswordService.requestReset({ email });
      setSubmittedEmail(email);
      setModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleResend = useCallback(async () => {
    if (!submittedEmail || isResending) {
      return;
    }

    try {
      setIsResending(true);
      await forgotPasswordService.requestReset({ email: submittedEmail });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to resend password reset email';
      showError(message);
    } finally {
      setIsResending(false);
    }
  }, [submittedEmail, isResending, showError ]);

  return (
    <>
      <Head>
        <title>Forgot Password - Black Hole Dashboard</title>
        <meta
          content="Forgot password to Black Hole Creator"
          name="description"
        />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>

      <Box
        minHeight={'100vh'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        p={3}
        sx={{
          bgcolor: 'primary.dark'
        }}
      >
        <Container maxWidth="sm">
          <ForgotPasswordForm onSubmit={handleSubmit} />
        </Container>
      </Box>

      <ForgotPasswordModal
        email={submittedEmail}
        isResending={isResending}
        open={modalOpen}
        onClose={handleCloseModal}
        onResend={handleResend}
      />
    </>
  );
}

// Export with authentication wrapper that excludes login from auth requirements
export default withAuth(ForgotPassword, { requireAuth: false });
