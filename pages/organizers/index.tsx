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

function Organizers() {
  return (
    <>
      <Head>
        <title>Organizers - Wukong Backoffice</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle
          heading="Organizers"
          subHeading="Manage event organizers and their permissions"
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
              <CardHeader title="Organizer Management" />
              <Divider />
              <CardContent>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    👥 Organizers
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    This is the organizers management page. Here you will be able to manage event organizers and their access levels.
                  </Typography>
                  
                  <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                    Coming Soon:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul>
                      <li>Add new organizers</li>
                      <li>Edit organizer profiles</li>
                      <li>Manage organizer permissions</li>
                      <li>Assign organizers to events</li>
                      <li>View organizer activity</li>
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

Organizers.getLayout = (page: ReactElement) => (
  <SidebarLayout>{page}</SidebarLayout>
);

export default Organizers;
