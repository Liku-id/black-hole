import LoginForm from '@/components/Auth/LoginForm';
import { Box, Container } from '@mui/material';
import Head from 'next/head';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Black Hole Dashboard</title>
        <meta name="description" content="Login to Black Hole Creator Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
