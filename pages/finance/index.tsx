import { Box, Grid } from '@mui/material';
import { useState } from 'react';

import { withAuth } from '@/components/Auth/withAuth';
import { H2 } from '@/components/common';
import FinanceAnalytic from '@/components/features/finance/analytic';
import FinanceTransaction from '@/components/features/finance/transaction';
import FinanceWithdrawal from '@/components/features/finance/withdrawal';
import DashboardLayout from '@/layouts/dashboard';

function Finance() {
  const [selectedEventOrganizerId, setSelectedEventOrganizerId] = useState<string | null>(null);

  const handleEventOrganizerSelect = (eventOrganizerId: string) => {
    setSelectedEventOrganizerId(eventOrganizerId);
  };

  return (
    <DashboardLayout>
      <Box>
        <H2 color="text.primary" fontWeight={700} marginBottom="34px">
          Finance
        </H2>

        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <FinanceAnalytic eventOrganizerId={selectedEventOrganizerId} />
          </Grid>

          <Grid item md={6} xs={12}>
            <FinanceWithdrawal onEventOrganizerSelect={handleEventOrganizerSelect} />
          </Grid>

          <Grid item xs={12}>
            <FinanceTransaction />
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

export default withAuth(Finance, { requireAuth: true });
