import DashboardLayout from '@/layouts/dashboard';
import {
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import Head from 'next/head';

export default function Tickets() {
  return (
    <DashboardLayout>
      <Head>
        <title>Tickets - Black Hole Dashboard</title>
      </Head>
      
      <Box>
        <Typography variant="h4" gutterBottom>
          Tickets
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage event tickets and sales
        </Typography>

        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Tickets Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ticket management features will be implemented here.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
