import EventsFilter from '@/components/EventsFilter';
import EventsTable from '@/components/EventsTable';
import Footer from '@/components/Footer';
import PageTitle from '@/components/PageTitle';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { useEvents } from '@/hooks/useEvents';
import SidebarLayout from '@/layouts/SidebarLayout';
import { EventsFilters } from '@/types/event';
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
import { useState } from 'react';

function Events() {
  const [filters, setFilters] = useState<EventsFilters>({
    show: 10,
    page: 1
  });

  const {
    events,
    loading,
    error,
    mutate,
    total,
    totalPage,
    currentPage,
    currentShow
  } = useEvents(filters);

  return (
    <>
      <Head>
        <title>Events - Wukong Backoffice</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle heading="Events" subHeading="Manage and organize events" />
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
                  Failed to load events
                </Typography>
                <Typography variant="body2">{error}</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Please check your backend connection and try again.
                </Typography>
              </Alert>
            )}

            <EventsFilter filters={filters} onFiltersChange={setFilters} />

            {!loading && events.length === 0 && !error && (
              <Card>
                <CardContent>
                  <Box textAlign="center" py={4}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No events found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no events in the system yet.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {(loading || events.length > 0) && (
              <EventsTable
                events={events}
                loading={loading}
                onRefresh={mutate}
              />
            )}
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
