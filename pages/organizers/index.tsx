import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import Head from 'next/head';

import { withAuth } from '@/components/Auth/withAuth';
import OrganizersTable from '@/components/OrganizersTable';
import { useOrganizers } from '@/hooks/features/organizers/useOrganizers';
import DashboardLayout from '@/layouts/dashboard';

function Organizers() {
  const { organizers, loading, error, mutate } = useOrganizers();

  return (
    <DashboardLayout>
      <Head>
        <title>Event Organizers - Black Hole Dashboard</title>
      </Head>

      <Box>
        <Typography gutterBottom variant="h4">
          Event Organizers
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }} variant="body1">
          Manage event organizers and their information
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography gutterBottom variant="subtitle2">
              Failed to load organizers
            </Typography>
            <Typography variant="body2">{error}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
              Please check your backend connection and try again.
            </Typography>
          </Alert>
        )}

        {!loading && organizers.length === 0 && !error && (
          <Card>
            <CardContent>
              <Box py={4} textAlign="center">
                <Typography gutterBottom color="text.secondary" variant="h6">
                  No organizers found
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  There are no event organizers in the system yet.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {(loading || organizers.length > 0) && (
          <OrganizersTable
            loading={loading}
            organizers={organizers}
            onRefresh={mutate}
          />
        )}
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(Organizers, { requireAuth: true });
