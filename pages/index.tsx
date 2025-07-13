import BaseLayout from '@/layouts/BaseLayout';
import {
  Box,
  Button,
  Card,
  Container,
  styled,
  Typography
} from '@mui/material';
import type { ReactElement } from 'react';

import Link from '@/components/Link';
import Head from 'next/head';

import Logo from '@/components/LogoSign';
import Hero from '@/content/Overview/Hero';

const HeaderWrapper = styled(Card)(
  ({ theme }) => `
  width: 100%;
  display: flex;
  align-items: center;
  height: ${theme.spacing(10)};
  margin-bottom: ${theme.spacing(10)};
`
);

const OverviewWrapper = styled(Box)(
  ({ theme }) => `
    overflow: auto;
    background: ${theme.palette.common.white};
    flex: 1;
    overflow-x: hidden;
`
);

function Overview() {
  return (
    <OverviewWrapper>
      <Head>
        <title>Wukong Backoffice Admin Dashboard</title>
      </Head>
      <HeaderWrapper>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center">
            <Logo />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flex={1}
            >
              <Box />
              <Box>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="contained"
                  sx={{ ml: 2 }}
                >
                  Enter Dashboard
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </HeaderWrapper>
      <Hero />
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Typography textAlign="center" variant="subtitle1">
          Powered by{' '}
          <Link
            href="https://liku.id"
            target="_blank"
            rel="noopener noreferrer"
          >
            Liku.id
          </Link>
        </Typography>
      </Container>
    </OverviewWrapper>
  );
}

export default Overview;

Overview.getLayout = function getLayout(page: ReactElement) {
  return <BaseLayout>{page}</BaseLayout>;
};
