import { Box, Grid } from '@mui/material';

import { useEventOrganizerSummary } from '@/hooks';
import { formatUtils } from '@/utils/formatUtils';

import AnalyticCard from './card';

const FinanceAnalytic = () => {
  const { summary, loading } = useEventOrganizerSummary();

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!summary) {
    return <Box>No data available</Box>;
  }

  const analyticsData = [
    {
      icon: '/icon/finance-revert.svg',
      title: 'Total Balance',
      value: formatUtils.formatPrice(parseFloat(summary.totalEarnings))
    },
    {
      icon: '/icon/finance-revert.svg',
      title: 'Total Available Balance',
      value: formatUtils.formatPrice(parseFloat(summary.totalAvailable))
    },
    {
      icon: '/icon/fee.svg',
      title: 'Total Platform Fee',
      value: formatUtils.formatPrice(parseFloat(summary.totalPlatformFees))
    },
    {
      icon: '/icon/time-revert.svg',
      title: 'Total Amount Pending',
      value: formatUtils.formatPrice(parseFloat(summary.pendingWithdrawals))
    }
  ];

  return (
    <Grid container spacing={3}>
      {analyticsData.map((item, index) => (
        <Grid key={index} item xs={6}>
          <AnalyticCard
            icon={item.icon}
            title={item.title}
            value={item.value}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default FinanceAnalytic;
