import { Grid } from '@mui/material';

import { formatUtils } from '@/utils/formatUtils';

import AnalyticCard from './card';

const FinanceAnalytic = () => {
  const analyticsData = [
    {
      icon: '/icon/finance-revert.svg',
      title: 'Total Balance',
      value: formatUtils.formatPrice(0)
    },
    {
      icon: '/icon/finance-revert.svg',
      title: 'Total Available Balance',
      value: formatUtils.formatPrice(0)
    },
    {
      icon: '/icon/fee.svg',
      title: 'Total Platform Fee',
      value: formatUtils.formatPrice(0)
    },
    {
      icon: '/icon/time-revert.svg',
      title: 'Total Amount Pending',
      value: formatUtils.formatPrice(0)
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
