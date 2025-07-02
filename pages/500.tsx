import Head from 'next/head';
import { Button, Container, Typography, Box } from '@mui/material';
import BaseLayout from 'src/layouts/BaseLayout';
import { useRouter } from 'next/router';

function Status500() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Status - 500</title>
      </Head>
      <BaseLayout>
        <Container maxWidth="md">
          <Box textAlign="center" py={5}>
            <Typography variant="h1" component="h1" gutterBottom>
              500
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              Internal Server Error
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Something went wrong on our end. Please try again later.
            </Typography>
            <Box mt={4}>
              <Button
                variant="contained"
                onClick={handleGoBack}
                sx={{ mr: 2 }}
              >
                Go Back
              </Button>
              <Button variant="outlined" onClick={handleGoHome}>
                Go Home
              </Button>
            </Box>
          </Box>
        </Container>
      </BaseLayout>
    </>
  );
}

export default Status500; 