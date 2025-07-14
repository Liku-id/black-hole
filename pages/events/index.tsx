import Footer from '@/components/Footer';
import PageTitle from '@/components/PageTitle';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import SidebarLayout from '@/layouts/SidebarLayout';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Container,
    Divider,
    Grid,
    Typography
} from '@mui/material';
import Head from 'next/head';
import type { ReactElement } from 'react';

function Events() {
  return (
    <>
      <Head>
        <title>Events - Wukong Backoffice</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle
          heading="Events"
          subHeading="Manage and organize events"
        />
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
            <Card>
              <CardHeader title="Events Management" />
              <Divider />
              <CardContent>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    📅 Events
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This is the events management page. Here you will be able to create, edit, and manage events.
                  </Typography>
                  
                  <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                    Coming Soon:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul>
                      <li>Create new events</li>
                      <li>Edit existing events</li>
                      <li>View event details</li>
                      <li>Manage event registrations</li>
                      <li>Event analytics and reports</li>
                    </ul>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

Events.getLayout = (page: ReactElement) => (
  <SidebarLayout>{page}</SidebarLayout>
);

export default Events;
