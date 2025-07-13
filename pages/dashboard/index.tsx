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

function DashboardOverview() {
  return (
    <>
      <Head>
        <title>Dashboard - Wukong Backoffice</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle
          heading="Dashboard Overview"
          subHeading="Welcome to Wukong Backoffice - Your comprehensive admin dashboard"
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
              <CardHeader title="Welcome to Wukong Backoffice" />
              <Divider />
              <CardContent>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h4" gutterBottom>
                    🚀 Getting Started
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your Wukong backoffice is now ready! This dashboard will be the central hub for managing your application.
                  </Typography>
                  
                  <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                    Next Steps:
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ul>
                      <li>Configure user management system</li>
                      <li>Set up content management tools</li>
                      <li>Implement analytics and reporting</li>
                      <li>Add system monitoring features</li>
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

DashboardOverview.getLayout = (page: ReactElement) => (
  <SidebarLayout>{page}</SidebarLayout>
);

export default DashboardOverview;
