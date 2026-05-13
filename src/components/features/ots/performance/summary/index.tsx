import { Box, useTheme } from '@mui/material';
import Image from 'next/image';

import { Body2, H2 } from '@/components/common';

interface OTSSummaryCardsProps {
  data?: {
    totalRevenue: number | string;
    ticketSold: number | string;
    totalTransaction: number | string;
    totalVisitors: number | string;
  };
  loading?: boolean;
}

export function OTSSummaryCards({ data, loading }: OTSSummaryCardsProps) {
  const theme = useTheme();

  const statsCards = [
    { title: 'Total Revenue', value: data?.totalRevenue || '0', icon: '/icon/finance-revert.svg' },
    { title: 'Ticket Sold', value: data?.ticketSold || '0', icon: '/icon/finance-revert.svg' },
    { title: 'Total Transaction', value: data?.totalTransaction || '0', icon: '/icon/fee.svg' },
    { title: 'Total Visitors', value: data?.totalVisitors || '0', icon: '/icon/time-revert.svg' }
  ];

  return (
    <Box
      display="grid"
      gap="30px"
      gridTemplateColumns="repeat(4, 1fr)"
    >
      {statsCards.map((card, index) => (
        <Box
          key={index}
          border={1}
          borderColor={theme.palette.grey[100]}
          padding="16px 12px"
          sx={{ backgroundColor: 'common.white', borderRadius: 0 }}
        >
          <Box alignItems="center" display="flex" mb="24px">
            <Image alt={card.title} height={24} src={card.icon} width={24} />
            <Body2
              fontSize="18px"
              fontWeight={400}
              ml="8px"
            >
              {card.title}
            </Body2>
          </Box>
          <H2 color="text.primary" fontSize="32px">
            {loading ? '...' : card.value}
          </H2>
        </Box>
      ))}
    </Box>
  );
}
