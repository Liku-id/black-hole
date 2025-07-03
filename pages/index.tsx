import { AuthGate } from '@/components/AuthGate';
import Footer from '@/components/Footer';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import SidebarLayout from '@/layouts/SidebarLayout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import Head from 'next/head';

const OverviewWrapper = styled(Box)(
  ({ theme }) => `
    padding: ${theme.spacing(4)};
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  `
);

const IconWrapper = styled(Box)(
  ({ theme }) => `
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: ${alpha(theme.colors.primary.main, 0.1)};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${theme.spacing(3)};
    
    .MuiSvgIcon-root {
      font-size: 60px;
      color: ${theme.colors.primary.main};
    }
  `
);

function OverviewPage() {
  return (
    <AuthGate>
      <>
        <Head>
          <title>Overview - TMS</title>
        </Head>
        <PageTitleWrapper>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h1" component="h1" gutterBottom>
              Overview
            </Typography>
          </Box>
        </PageTitleWrapper>
        <Container maxWidth="lg">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={4}
          >
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  background: 'transparent',
                  boxShadow: 'none'
                }}
              >
                <OverviewWrapper>
                  <IconWrapper>
                    <DashboardIcon />
                  </IconWrapper>
                  <Typography variant="h2" component="h2" gutterBottom sx={{ mb: 2 }}>
                    Welcome to TMS Dashboard
                  </Typography>
                  <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
                    This is your central command center for managing events and organizers. 
                    Navigate through the sidebar to access different sections of your application.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Paper
                      sx={{
                        p: 3,
                        minWidth: 200,
                        textAlign: 'center',
                        background: (theme) => alpha(theme.colors.primary.main, 0.05),
                        border: (theme) => `1px solid ${alpha(theme.colors.primary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Events
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage your events and view event details
                      </Typography>
                    </Paper>
                    <Paper
                      sx={{
                        p: 3,
                        minWidth: 200,
                        textAlign: 'center',
                        background: (theme) => alpha(theme.colors.secondary.main, 0.05),
                        border: (theme) => `1px solid ${alpha(theme.colors.secondary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Organizers
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View and manage event organizers
                      </Typography>
                    </Paper>
                  </Box>
                </OverviewWrapper>
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </>
    </AuthGate>
  );
}

OverviewPage.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default OverviewPage;
