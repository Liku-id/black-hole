import { Box, Grid } from '@mui/material';

import { useEventOrganizerSummary } from '@/hooks';
import { formatUtils } from '@/utils/formatUtils';

import AnalyticCard from './card';

interface FinanceAnalyticProps {
  eventOrganizerId?: string | null;
}

const FinanceAnalytic = ({ eventOrganizerId }: FinanceAnalyticProps) => {
  const { summary, loading } = useEventOrganizerSummary(eventOrganizerId);

  if (loading) {
    return <Box>Loading...</Box>;
  }

  const analyticsData = [
    {
      icon: '/icon/finance-revert.svg',
      title: 'Total Balance',
      value: formatUtils.formatPrice(parseFloat(summary?.totalEarnings || '0'))
    },
    {
      icon: '/icon/finance-revert.svg',
      title: 'Total Available Balance',
      value: formatUtils.formatPrice(parseFloat(summary?.totalAvailable || '0'))
    },
    {
      icon: '/icon/fee.svg',
      title: 'Total Platform Fee',
      value: formatUtils.formatPrice(parseFloat(summary?.totalPlatformFees || '0'))
    },
    {
      icon: '/icon/time-revert.svg',
      title: 'Total Amount Pending',
      value: formatUtils.formatPrice(parseFloat(summary?.pendingWithdrawals || '0'))
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
