import LoginForm from '@/components/Auth/LoginForm';
import { Box, Container, styled } from '@mui/material';
import Head from 'next/head';
import React from 'react';

const LoginContainer = styled(Container)(
  ({ theme }) => `
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.gradients.blue5};
    padding: ${theme.spacing(3)};
  `
);

const LoginWrapper = styled(Box)(
  () => `
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `
);

const LoginPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Login - Wukong Backoffice</title>
        <meta name="description" content="Login to Wukong Backoffice Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <LoginContainer maxWidth={false} disableGutters>
        <LoginWrapper>
          <LoginForm />
        </LoginWrapper>
      </LoginContainer>
    </>
  );
};

// Exclude login page from auth protection
(LoginPage as any).requireAuth = false;

export default LoginPage;
