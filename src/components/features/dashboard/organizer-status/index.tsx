import Image from 'next/image';
import { Box, Grid, Alert, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { Body1, Button, H4 } from '@/components/common';
import { useEventOrganizerMe } from '@/hooks';

const OrganizerRegStatus = () => {
  const router = useRouter();

  // Fetch
  const { data, loading, error } = useEventOrganizerMe();

  const registerData = [
    {
      id: 'general-information',
      name: 'General Information',
      isComplete: data?.isGeneralComplete || false,
      redirectUrl: '/account?doc=general'
    },
    {
      id: 'legal-document',
      name: 'Legal Document',
      isComplete: data?.isLegalCompelete || false,
      redirectUrl: '/account?doc=legal'
    },
    {
      id: 'bank-account',
      name: 'Bank Account',
      isComplete: data?.isBankComplete || false,
      redirectUrl: '/account?doc=bank'
    }
  ];

  // Loading
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid key={item} item xs={12} md={4}>
          <Box
            sx={{
              backgroundColor: 'common.white',
              boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.05)',
              padding: '20px 16px'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                marginBottom: 5
              }}
            >
              <Skeleton variant="circular" width={22} height={22} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  // Error
  if (error) {
    return (
      <Box marginBottom={3.75}>
        <H4 color="text.primary" fontWeight={700} marginBottom={1.5}>
          Finish your registration account
        </H4>
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          An error occurred while loading the registration data. Please try
          again.
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Button onClick={() => window.location.reload()} size="small">
            Reload
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box marginBottom={3.75}>
      <H4 color="text.primary" fontWeight={700} marginBottom={1.5}>
        Finish your registration account
      </H4>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <Grid container spacing={3}>
          {registerData.map((item) => (
            <Grid key={item.id} item xs={12} md={4}>
              <Box
                sx={{
                  backgroundColor: 'common.white',
                  boxShadow: '0 4px 20px 0 rgba(40, 72, 107, 0.05)',
                  padding: '20px 16px'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    marginBottom: 5
                  }}
                >
                  <Image
                    alt={`${item.id}-status`}
                    height={22}
                    src={
                      item.isComplete ? '/icon/check.svg' : '/icon/wrong.svg'
                    }
                    width={22}
                  />
                  <Body1 color="text.primary" fontWeight={700}>
                    {`Complete ${item.name}`}
                  </Body1>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                  <Button
                    onClick={() => router.push(item.redirectUrl)}
                    sx={{ padding: '9px 12px', fontSize: '12px' }}
                  >
                    {`Edit ${item.name}`}
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default OrganizerRegStatus;
