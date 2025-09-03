import { Box, Card, CardContent, Typography } from '@mui/material';
import Head from 'next/head';

import { withAuth } from '@/components/Auth/withAuth';
import DashboardLayout from '@/layouts/dashboard';

function Transactions() {
  return (
    <DashboardLayout>
      <Head>
        <title>Transactions - Black Hole Dashboard</title>
      </Head>

      <Box>
        <Typography gutterBottom variant="h4">
          Transactions
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }} variant="body1">
          View and manage financial transactions
        </Typography>

        <Card>
          <CardContent>
            <Box py={4} textAlign="center">
              <Typography gutterBottom color="text.secondary" variant="h6">
                Transaction History
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Transaction management features will be implemented here.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

// Export with authentication wrapper that requires authentication
export default withAuth(Transactions, { requireAuth: true });
