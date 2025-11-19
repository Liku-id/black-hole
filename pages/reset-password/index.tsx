import { Box, Container, Typography } from '@mui/material';
import Head from 'next/head';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import ResetPasswordForm, {
  ResetPasswordFormData
} from '@/components/features/reset-password/form';
import ResetPasswordModal from '@/components/features/reset-password/modal';
import { withAuth } from '@/components/Auth/withAuth';
import { useToast } from '@/contexts/ToastContext';
import { forgotPasswordService } from '@/services';

function ResetPassword() {
  const router = useRouter();
  const { showError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { email, token } = router.query;

  const isLinkValid = useMemo(
    () => typeof email === 'string' && typeof token === 'string',
    [email, token]
  );

  const handleSubmit = useCallback(
    async ({ newPassword }: ResetPasswordFormData) => {
      if (!isLinkValid) {
        showError('Invalid or expired reset link');
        return;
      }

      try {
        await forgotPasswordService.changePassword({
          email: email as string,
          token: token as string,
          newPassword
        });

        setIsModalOpen(true);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to reset password';
        showError(message);
      }
    },
    [email, isLinkValid, router, showError, token]
  );

  return (
    <>
      <Head>
        <title>Reset Password - Black Hole Dashboard</title>
        <meta content="Reset password for Black Hole Creator" name="description" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>

      <Box
        alignItems="center"
        display="flex"
        justifyContent="center"
        minHeight="100vh"
        p={3}
        sx={{ bgcolor: 'primary.dark' }}
      >
        <Container maxWidth="sm">
          {isLinkValid ? (
            <ResetPasswordForm onSubmit={handleSubmit} />
          ) : (
            <Box
              bgcolor="background.paper"
              borderRadius={2}
              p={4}
              textAlign="center"
            >
              <Typography color="text.primary" variant="h6" gutterBottom>
                Invalid Reset Link
              </Typography>
              <Typography color="text.secondary">
                The password reset link is invalid or has expired. Please request
                a new link.
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      <ResetPasswordModal
        open={isModalOpen}
        onLogin={() => {
          void router.push('/login');
        }}
      />
    </>
  );
}

export default withAuth(ResetPassword, { requireAuth: false });
