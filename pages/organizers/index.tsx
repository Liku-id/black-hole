import Footer from '@/components/Footer';
import OrganizersTable from '@/components/OrganizersTable';
import PageTitle from '@/components/PageTitle';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { useOrganizers } from '@/hooks/useOrganizers';
import SidebarLayout from '@/layouts/SidebarLayout';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography
} from '@mui/material';
import Head from 'next/head';
import type { ReactElement } from 'react';

function Organizers() {
  const { organizers, loading, error, mutate } = useOrganizers();

  return (
    <>
      <Head>
        <title>Event Organizers - Wukong Backoffice</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle
          heading="Event Organizers"
          subHeading="Manage event organizers and their information"
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
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Failed to load organizers
                </Typography>
                <Typography variant="body2">
                  {error}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Please check your backend connection and try again.
                </Typography>
              </Alert>
            )}
            
            {!loading && organizers.length === 0 && !error && (
              <Card>
                <CardContent>
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No organizers found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no event organizers in the system yet.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
            
            {(loading || organizers.length > 0) && (
              <OrganizersTable organizers={organizers} loading={loading} onRefresh={mutate} />
            )}
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
