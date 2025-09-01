import { Box, Container } from '@mui/material';
import Head from 'next/head';

import LoginForm from '@/components/Auth/LoginForm';

export default function LoginPage() {
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
        <Container maxWidth="sm">
          <LoginForm />
        </Container>
      </Box>
    </>
  );
}

// Exclude login page from auth protection
(LoginPage as any).requireAuth = false;
