import { Box, Container } from '@mui/material';
import Head from 'next/head';

import LoginForm from '@/components/Auth/LoginForm';
import { withAuth } from '@/components/Auth/withAuth';

function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Black Hole Dashboard</title>
        <meta
          content="Login to Black Hole Creator Dashboard"
          name="description"
        />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LoginForm />
        </Container>
      </Box>
    </>
  );
}

// Export with authentication wrapper that excludes login from auth requirements
export default withAuth(LoginPage, { requireAuth: false });
