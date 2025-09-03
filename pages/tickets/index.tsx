import { Box, Card, CardContent, Typography } from '@mui/material';
import Head from 'next/head';

import { withAuth } from '@/components/Auth/withAuth';
import DashboardLayout from '@/layouts/dashboard';

function Tickets() {
  return (
    <DashboardLayout>
      <Head>
        <title>Tickets - Black Hole Dashboard</title>
      </Head>

      <Box>
        <Typography gutterBottom variant="h4">
          Tickets
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }} variant="body1">
          Manage event tickets and sales
        </Typography>

        <Card>
          <CardContent>
            <Box py={4} textAlign="center">
              <Typography gutterBottom color="text.secondary" variant="h6">
                Tickets Management
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Ticket management features will be implemented here.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(Tickets, { requireAuth: true });
