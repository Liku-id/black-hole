import Head from 'next/head';

import { AuthGate } from '@/components/AuthGate';
import SidebarLayout from '@/layouts/SidebarLayout';

import Footer from '@/components/Footer';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageHeader from '@/content/Dashboards/Crypto/PageHeader';
import { Container, Grid } from '@mui/material';

import AccountBalance from '@/content/Dashboards/Crypto/AccountBalance';
import AccountSecurity from '@/content/Dashboards/Crypto/AccountSecurity';
import Wallets from '@/content/Dashboards/Crypto/Wallets';
import WatchList from '@/content/Dashboards/Crypto/WatchList';

function DashboardCrypto() {
  return (
    <AuthGate>
      <>
        <Head>
          <title>Crypto Dashboard</title>
        </Head>
        <PageTitleWrapper>
          <PageHeader />
        </PageTitleWrapper>
        <Container maxWidth="lg">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={4}
          >
            <Grid item xs={12}>
              <AccountBalance />
            </Grid>
            <Grid item lg={8} xs={12}>
              <Wallets />
            </Grid>
            <Grid item lg={4} xs={12}>
              <AccountSecurity />
            </Grid>
            <Grid item xs={12}>
              <WatchList />
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </>
    </AuthGate>
  );
}

DashboardCrypto.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default DashboardCrypto;
