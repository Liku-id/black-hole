import Footer from '@/components/Footer';
import PageTitle from '@/components/PageTitle';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { useEventDetail } from '@/hooks/useEventDetail';
import SidebarLayout from '@/layouts/SidebarLayout';
import { formatIndonesianDateTime, formatPhoneNumber } from '@/utils';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareIcon from '@mui/icons-material/Share';
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useState } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function EventDetail() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const { eventDetail, loading, error, mutate } = useEventDetail(
    metaUrl as string
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Event - Wukong Backoffice</title>
        </Head>
        <PageTitleWrapper>
          <PageTitle
            heading="Event Detail"
            subHeading="Loading event information..."
          />
        </PageTitleWrapper>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" height={200} />
                  <Box sx={{ mt: 2 }}>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </>
    );
  }

  if (error || !eventDetail) {
    return (
      <>
        <Head>
          <title>Event Not Found - Wukong Backoffice</title>
        </Head>
        <PageTitleWrapper>
          <PageTitle
            heading="Event Not Found"
            subHeading="The requested event could not be found"
          />
        </PageTitleWrapper>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Failed to load event
                </Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/events')}
              >
                Back to Events
              </Button>
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </>
    );
  }

  const mainImage = eventDetail.eventAssets?.[0]?.asset?.url;

  return (
    <>
      <Head>
        <title>{eventDetail.name} - Wukong Backoffice</title>
      </Head>
      <PageTitleWrapper>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => router.push('/events')}
            sx={{ color: theme.palette.primary.main }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
              <Link
                color="inherit"
                href="/events"
                sx={{
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Events
              </Link>
              <Typography color="text.primary">{eventDetail.name}</Typography>
            </Breadcrumbs>
            <PageTitle
              heading={eventDetail.name}
              subHeading={eventDetail.eventType}
            />
          </Box>
        </Box>
      </PageTitleWrapper>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Hero Section */}
          <Grid item xs={12}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                background: mainImage
                  ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${mainImage})`
                  : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                color: 'white'
              }}
            >
              <CardContent sx={{ width: '100%', p: 4 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                      {eventDetail.name}
                    </Typography>
                    <Chip
                      label={eventDetail.eventType}
                      color="primary"
                      sx={{
                        mb: 2,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                      {eventDetail.description}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarTodayIcon />
                        <Typography variant="body2">
                          {formatDate(eventDetail.startDate)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOnIcon />
                        <Typography variant="body2">
                          {eventDetail.city.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4} textAlign="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <IconButton
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                      <IconButton
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={mutate}
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Event Details */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader
                title="Event Details"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}04)`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              />
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="event tabs"
                  >
                    <Tab label="Overview" />
                    <Tab label="Tickets" />
                    <Tab label="Payment Methods" />
                    <Tab label="Terms & Conditions" />
                  </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Event Information
                        </Typography>
                        <Stack spacing={2}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <EventIcon color="primary" />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Event Type
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {eventDetail.eventType}
                              </Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <CalendarTodayIcon color="primary" />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Start Date
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {formatDate(eventDetail.startDate)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <AccessTimeIcon color="primary" />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                End Date
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {formatDate(eventDetail.endDate)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <LocationOnIcon color="primary" />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Location
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {eventDetail.address}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {eventDetail.city.name}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Description
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {eventDetail.description}
                        </Typography>
                      </Box>
                      {eventDetail.websiteUrl && (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Website
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<LanguageIcon />}
                            href={eventDetail.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Website
                          </Button>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Ticket Types
                  </Typography>
                  {eventDetail.ticketTypes.length > 0 ? (
                    <Grid container spacing={2}>
                      {eventDetail.ticketTypes.map((ticket) => (
                        <Grid item xs={12} md={6} key={ticket.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography
                                variant="h6"
                                color="primary"
                                gutterBottom
                              >
                                {ticket.name}
                              </Typography>
                              <Typography
                                variant="h5"
                                fontWeight="bold"
                                color="primary"
                              >
                                {formatPrice(ticket.price)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Quantity: {ticket.quantity}
                              </Typography>
                              {ticket.description && (
                                <Typography variant="body2">
                                  {ticket.description}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No ticket types available for this event.
                    </Typography>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" gutterBottom>
                    Payment Methods
                  </Typography>
                  {eventDetail.paymentMethods.length > 0 ? (
                    <Grid container spacing={2}>
                      {eventDetail.paymentMethods.map((method) => (
                        <Grid item xs={12} md={4} key={method.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  src={method.logo}
                                  sx={{ width: 40, height: 40 }}
                                >
                                  <PaymentIcon />
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="medium"
                                  >
                                    {method.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {method.bank?.name || method.type}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No payment methods available for this event.
                    </Typography>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Typography variant="h6" gutterBottom>
                    Terms & Conditions
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {eventDetail.termAndConditions ||
                      'No terms and conditions available.'}
                  </Typography>
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>

          {/* Organizer Information */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader
                title="Event Organizer"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.info.main}08, ${theme.palette.info.main}04)`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              />
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: theme.palette.info.main
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {eventDetail.eventOrganizer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Event Organizer
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <EmailIcon color="info" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {eventDetail.eventOrganizer.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PhoneIcon color="info" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {formatPhoneNumber(
                          eventDetail.eventOrganizer.phone_number
                        )}
                      </Typography>
                    </Box>
                  </Box>
                  {eventDetail.eventOrganizer.address && (
                    <Box display="flex" alignItems="center" gap={2}>
                      <LocationOnIcon color="info" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1">
                          {eventDetail.eventOrganizer.address}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {eventDetail.eventOrganizer.description && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {eventDetail.eventOrganizer.description}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Event Status */}
            <Card sx={{ mt: 3, borderRadius: 3 }}>
              <CardHeader
                title="Event Status"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main}08, ${theme.palette.success.main}04)`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={eventDetail.eventStatus}
                      color="success"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Admin Fee
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {eventDetail.adminFee}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1">
                      {formatIndonesianDateTime(eventDetail.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

EventDetail.getLayout = (page: ReactElement) => (
  <SidebarLayout>{page}</SidebarLayout>
);

export default EventDetail;
