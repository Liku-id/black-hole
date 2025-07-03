import { AuthGate } from '@/components/AuthGate';
import Footer from '@/components/Footer';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import PageHeader from '@/content/Events/PageHeader';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Container, Grid } from '@mui/material';
import Head from 'next/head';

import EventsList from '@/content/Events/EventsList';

function EventsPage() {
  return (
    <AuthGate>
      <>
        <Head>
          <title>Events - TMS</title>
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
              <EventsList />
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </>
    </AuthGate>
  );
}

EventsPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default EventsPage;
