import { Box, useTheme, Skeleton } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { H2, Body2 } from '@/components/common';
import { useTransactionSummary } from '@/hooks';
import { formatUtils } from '@/utils/formatUtils';

export function TransactionSummary() {
  const theme = useTheme();
  const router = useRouter();
  const { eventId } = router.query as { eventId: string };

  const { summary, loading } = useTransactionSummary(eventId);

  const cards = [
    {
      title: 'Total Ticket Sales',
      value: formatUtils.formatNumber(summary?.ticketSales.total || 0),
      icon: '/icon/ticket-v2.svg'
    },
    {
      title: 'Total Payment',
      value: formatUtils.formatCurrency(summary?.payment || 0),
      icon: '/icon/finance-revert.svg'
    },
    {
      title: 'Total Withdrawal',
      value: formatUtils.formatCurrency(summary?.withdrawal || 0),
      icon: '/icon/finance-revert.svg'
    },
    {
      title: 'Available Balance',
      value: formatUtils.formatCurrency(summary?.balance || 0),
      icon: '/icon/fee.svg'
    }
  ];

  return (
    <Box
      display="grid"
      gap="16px"
      gridTemplateColumns="repeat(4, 1fr)"
      mb="16px"
    >
      {cards.map((card, index) => (
        <Box
          key={index}
          border={1}
          borderColor={theme.palette.grey[100]}
          padding="16px 12px"
          sx={{ backgroundColor: 'common.white' }}
        >
          <Box alignItems="center" display="flex" mb="24px">
            <Image alt={card.title} height={24} src={card.icon} width={24} />
            <Body2
              color="text.secondary"
              fontSize="18px"
              fontWeight={400}
              ml="8px"
            >
              {card.title}
            </Body2>
          </Box>
          <H2 color="text.primary" fontSize="32px">
            {loading ? <Skeleton width="60%" /> : card.value}
          </H2>
        </Box>
      ))}
    </Box>
  );
}
