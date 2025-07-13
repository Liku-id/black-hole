import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    styled
} from '@mui/material';

import Link from '@/components/Link';

const TypographyH1 = styled(Typography)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(50)};
`
);

const TypographyH2 = styled(Typography)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(17)};
`
);

const LabelWrapper = styled(Box)(
  ({ theme }) => `
    background-color: ${theme.colors.success.main};
    color: ${theme.palette.success.contrastText};
    font-weight: bold;
    border-radius: 30px;
    text-transform: uppercase;
    display: inline-block;
    font-size: ${theme.typography.pxToRem(11)};
    padding: ${theme.spacing(0.5)} ${theme.spacing(1.5)};
    margin-bottom: ${theme.spacing(2)};
`
);

function Hero() {
  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
      <Grid
        spacing={{ xs: 6, md: 10 }}
        justifyContent="center"
        alignItems="center"
        container
      >
        <Grid item md={10} lg={8} mx="auto">
          <LabelWrapper color="success">Backoffice v1.0</LabelWrapper>
          <TypographyH1 sx={{ mb: 2 }} variant="h1">
            Wukong Backoffice Dashboard
          </TypographyH1>
          <TypographyH2
            sx={{ lineHeight: 1.5, pb: 4 }}
            variant="h4"
            color="text.secondary"
            fontWeight="normal"
          >
            Comprehensive admin dashboard for managing your Wukong application. 
            Built with Next.js, TypeScript, and Material-UI for optimal performance and user experience.
          </TypographyH2>
          <Button
            component={Link}
            href="/dashboard"
            size="large"
            variant="contained"
          >
            Access Dashboard
          </Button>
          <Button
            sx={{ ml: 2 }}
            component="a"
            target="_blank"
            rel="noopener"
            href="/auth"
            size="large"
            variant="text"
          >
            Login / Register
          </Button>
          <Grid container spacing={3} mt={5}>
            <Grid item md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4">
                  🎛️ Complete Control
                </Typography>
              </Box>
              <Typography component="span" variant="subtitle2">
                Manage users, content, and system settings from a single, 
                intuitive interface designed for administrators.
              </Typography>
            </Grid>
            <Grid item md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4">
                  📊 Real-time Analytics
                </Typography>
              </Box>
              <Typography component="span" variant="subtitle2">
                Monitor system performance, user activity, and key metrics 
                with comprehensive dashboards and reporting tools.
              </Typography>
            </Grid>
            <Grid item md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4">
                  🔒 Secure & Scalable
                </Typography>
              </Box>
              <Typography component="span" variant="subtitle2">
                Built with modern security practices and designed to scale 
                with your growing business needs and user base.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Hero;
