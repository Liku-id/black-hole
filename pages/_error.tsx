import type { NextPage } from 'next';
import type { NextPageContext } from 'next/types';
import Head from 'next/head';
import { Button, Container, Typography, Box } from '@mui/material';
import BaseLayout from 'src/layouts/BaseLayout';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

const Error: NextPage<ErrorProps> = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    // eslint-disable-next-line no-underscore-dangle
    // @ts-ignore
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-underscore-dangle
      // @ts-ignore
      window.__NEXT_DATA__.props = {
        ...window.__NEXT_DATA__.props,
        hasGetInitialPropsRun: true
      };
    }
  }

  return (
    <>
      <Head>
        <title>Error {statusCode}</title>
      </Head>
      <BaseLayout>
        <Container maxWidth="md">
          <Box textAlign="center" py={5}>
            <Typography variant="h1" component="h1" gutterBottom>
              {statusCode || 'Error'}
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              {statusCode === 404
                ? 'Page Not Found'
                : statusCode === 500
                ? 'Internal Server Error'
                : 'Something went wrong'}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {statusCode === 404
                ? 'The page you are looking for does not exist.'
                : 'An unexpected error occurred. Please try again later.'}
            </Typography>
            <Box mt={4}>
              <Button
                variant="contained"
                onClick={() => window.history.back()}
                sx={{ mr: 2 }}
              >
                Go Back
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>
            </Box>
          </Box>
        </Container>
      </BaseLayout>
    </>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, hasGetInitialPropsRun: true };
};

export default Error; 