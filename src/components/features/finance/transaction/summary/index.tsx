import { Box, useTheme, Skeleton } from '@mui/material';
import Image from 'next/image';

import { H2, Body2 } from '@/components/common';
import { useTransactionSummary } from '@/hooks';
import { formatUtils } from '@/utils/formatUtils';

interface TransactionSummaryProps {
  eventId?: string;
}

export function TransactionSummary({ eventId }: TransactionSummaryProps) {
  const theme = useTheme();

  const { summary, loading } = useTransactionSummary(eventId || '');

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
      gridTemplateColumns={{
        xs: '1fr',
        sm: '1fr 1fr',
        md: 'repeat(4, 1fr)'
      }}
    >
      {cards.map((card, index) => (
        <Box
          key={index}
          border={1}
          borderColor={theme.palette.grey[100]}
          padding="16px 12px"
          sx={{ backgroundColor: 'common.white', minWidth: 0, overflow: 'hidden' }}
        >
          <Box alignItems="center" display="flex" mb="24px" minWidth={0}>
            <Image alt={card.title} height={24} src={card.icon} width={24} />
            <Body2
              color="text.secondary"
              fontWeight={400}
              ml="8px"
              sx={{
                fontSize: { xs: '14px', sm: '18px' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0
              }}
            >
              {card.title}
            </Body2>
          </Box>
          <H2
            color="text.primary"
            sx={{
              fontSize: { xs: '22px', sm: '28px', md: '32px' },
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          >
            {loading ? <Skeleton width="60%" /> : card.value}
          </H2>
        </Box>
      ))}
    </Box>
  );
}
