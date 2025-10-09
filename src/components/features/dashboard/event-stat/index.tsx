import Image from 'next/image';
import { useRouter } from 'next/router';
import { Box, Grid, Alert, Skeleton } from '@mui/material';
import { Body1, Body2, H2, Button } from '@/components/common';
import { useEventOrganizerStatistics } from '@/hooks';
import { formatUtils } from '@/utils/formatUtils';

interface EventStatisticProps {
  eventOrganizerId?: string;
}

const EventStatistic = ({ eventOrganizerId }: EventStatisticProps) => {
  const router = useRouter();

  // Fetch - pass eventOrganizerId only if it's not empty
  const { data, loading, error } = useEventOrganizerStatistics(
    eventOrganizerId || undefined
  );

  const stats = [
    {
      id: 'ticket-sold',
      title: 'Total Ticket Sold',
      value: data
        ? formatUtils.formatLargeNumber(+data.total_tickets_sold)
        : '0',
      miniDesc: 'Ticket',
      redirectPath: '/tickets',
      iconUrl: '/icon/coupon.svg'
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: data
        ? formatUtils.formatAbbreviatedCurrency(+data.total_revenue)
        : 'Rp 0',
      redirectPath: '/finance',
      iconUrl: '/icon/pie.svg'
    },
    {
      id: 'transaction',
      title: 'Total Transaction',
      value: data
        ? formatUtils.formatNumber(+data.total_successful_transactions)
        : '0',
      redirectPath: '/finance',
      iconUrl: '/icon/user.svg'
    },
    {
      id: 'average',
      title: 'Average Transaction',
      value: data
        ? +data.average_tickets_per_transaction.toFixed(2).toString()
        : '0',
      redirectPath: '/finance',
      iconUrl: '/icon/transaction.svg'
    }
  ];

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  // Loading
  const LoadingSkeleton = () => (
    <Grid container spacing={3} marginBottom={3.75}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item}>
          <Box
            sx={{
              backgroundColor: 'common.white',
              boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.05)',
              padding: '18px 16px'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 3.5
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  width: '70%'
                }}
              >
                <Skeleton variant="circular" width={22} height={22} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
              <Skeleton variant="circular" width={20} height={20} />
            </Box>

            <Skeleton variant="text" width="45%" height={54} />
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  // Error
  if (error) {
    return (
      <Box marginBottom={3.75}>
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          An error occurred while loading statistics data. Please try again.
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Button onClick={() => window.location.reload()} size="small">
            Reload
          </Button>
        </Box>
      </Box>
    );
  }

  // Stat Card
  const StatCard = ({ stat }: { stat: (typeof stats)[0] }) => {
    return (
      <Box
        onClick={() => handleCardClick(stat.redirectPath)}
        sx={{
          backgroundColor: 'common.white',
          boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.05)',
          padding: '18px 16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 30px 0 rgba(40, 72, 107, 0.12)',
            transform: 'translateY(-2px)',
            '& .arrow-icon': {
              transform: 'translate(4px, -4px)',
              opacity: 1
            }
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 3.5
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Image alt={stat.title} height={22} src={stat.iconUrl} width={22} />
            <Body2 color="text.primary" fontWeight={400}>
              {stat.title}
            </Body2>
          </Box>

          <Box
            className="arrow-icon"
            sx={{
              transition: 'all 0.3s ease',
              opacity: 0.6
            }}
          >
            <Image
              alt="arrow"
              src="/icon/slanted-arrow.svg"
              height={20}
              width={20}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'end', gap: 0.5 }}>
          <H2 color="text.primary" fontWeight={600}>
            {stat.value}
          </H2>
          {stat.miniDesc && (
            <Body1 color="text.secondary" fontWeight={400} marginBottom={0.7}>
              {stat.miniDesc}
            </Body1>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <Grid container spacing={3} marginBottom={3.75}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.id}>
              <StatCard stat={stat} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default EventStatistic;
