import { Grid } from '@mui/material';

import { useWithdrawalSummaries } from '@/hooks';
import { formatUtils } from '@/utils/formatUtils';

import AnalyticCard from './card';

const FinanceAnalytic = () => {
  const { summaries } = useWithdrawalSummaries();

  const calculateTotals = () => {
    if (!summaries || summaries.length === 0) {
      return {
        totalBalance: 0,
        totalAvailableBalance: 0,
        totalPlatformFee: 0,
        totalAmountPending: 0
      };
    }

    return summaries.reduce(
      (totals, summary) => {
        return {
          totalBalance:
            totals.totalBalance + parseFloat(summary.totalAmount || '0'),
          totalAvailableBalance:
            totals.totalAvailableBalance +
            parseFloat(summary.availableAmount || '0'),
          totalPlatformFee:
            totals.totalPlatformFee +
            parseFloat(summary.withdrawalAmount || '0') * 0.05, // 5% platform fee
          totalAmountPending:
            totals.totalAmountPending +
            parseFloat(summary.pendingSettlementAmount || '0')
        };
      },
      {
        totalBalance: 0,
        totalAvailableBalance: 0,
        totalPlatformFee: 0,
        totalAmountPending: 0
      }
    );
  };

  const totals = calculateTotals();

  const analyticsData = [
    {
      icon: '/icon/finance-revert.svg',
      title: 'Total Balance',
      value: formatUtils.formatPrice(totals.totalBalance)
    },
    {
      icon: '/icon/finance-revert.svg',
      title: 'Total Available Balance',
      value: formatUtils.formatPrice(totals.totalAvailableBalance)
    },
    {
      icon: '/icon/fee.svg',
      title: 'Total Platform Fee',
      value: formatUtils.formatPrice(totals.totalPlatformFee)
    },
    {
      icon: '/icon/time-revert.svg',
      title: 'Total Amount Pending',
      value: formatUtils.formatPrice(totals.totalAmountPending)
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
