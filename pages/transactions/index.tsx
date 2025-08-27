import DashboardLayout from '@/layouts/dashboard';
import {
  Box,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import Head from 'next/head';

export default function Transactions() {
  return (
    <DashboardLayout>
      <Head>
        <title>Transactions - Black Hole Dashboard</title>
      </Head>
      
      <Box>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          View and manage financial transactions
        </Typography>

        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Transaction History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transaction management features will be implemented here.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
