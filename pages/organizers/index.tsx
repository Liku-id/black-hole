import { AuthGate } from '@/components/AuthGate';
import Footer from '@/components/Footer';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageHeader from '@/content/Organizers/PageHeader';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Container, Grid } from '@mui/material';
import Head from 'next/head';

import OrganizersList from '@/content/Organizers/OrganizersList';

function ApplicationsTransactions() {
  return (
    <AuthGate>
      <>
        <Head>
          <title>Organizers - TMS</title>
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
            spacing={3}
          >
            <Grid item xs={12}>
              <OrganizersList />
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </>
    </AuthGate>
  );
}

ApplicationsTransactions.getLayout = (page) => (
  <SidebarLayout>{page}</SidebarLayout>
);

export default ApplicationsTransactions;
