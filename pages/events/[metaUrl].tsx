import Footer from '@/components/Footer';
import PageTitle from '@/components/PageTitle';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import TicketListTable from '@/components/TicketListTable';
import TransactionsTable from '@/components/TransactionsTable';
import { useEventDetail } from '@/hooks/useEventDetail';
import { useTickets } from '@/hooks/useTickets';
import { useTransactions } from '@/hooks/useTransactions';
import SidebarLayout from '@/layouts/SidebarLayout';
import { formatIndonesianDateTime, formatPhoneNumber } from '@/utils';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  TablePagination
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';

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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function EventDetail() {
  const router = useRouter();
  const { metaUrl } = router.query;
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [listTabValue, setListTabValue] = useState(0);
  const [organizerDialogOpen, setOrganizerDialogOpen] = useState(false);
  const [ticketFilters, setTicketFilters] = useState({
    eventId: '',
    page: 0,
    show: 10,
    search: ''
  });

  const [transactionFilters, setTransactionFilters] = useState({
    page: 0,
    limit: 10
  });

  const { eventDetail, loading, error, mutate } = useEventDetail(
    metaUrl as string
  );

  const {
    tickets,
    loading: ticketsLoading,
    error: ticketsError,
    mutate: mutateTickets,
    total: ticketsTotal,
    currentPage: ticketsCurrentPage,
    currentShow: ticketsCurrentShow
  } = useTickets(ticketFilters);

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: mutateTransactions
  } = useTransactions(eventDetail?.id || '', transactionFilters);

  // Update ticket filters when event detail is loaded
  useEffect(() => {
    if (eventDetail?.id) {
      setTicketFilters((prev) => ({
        ...prev,
        eventId: eventDetail.id
      }));
    }
  }, [eventDetail?.id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleListTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setListTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTicketFilters((prev) => ({
      ...prev,
      search: event.target.value,
      page: 0 // Reset to first page when searching
    }));
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
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/events')}
            sx={{ borderRadius: 2 }}
          >
            Back to Events
          </Button>
        </Box>
      </PageTitleWrapper>

      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="stretch">
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
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}
                    >
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
                    <Typography
                      variant="h6"
                      sx={{
                        opacity: 0.9,
                        mb: 2,
                        color: 'white',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {eventDetail.description}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarTodayIcon />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                          }}
                        >
                          {formatDate(eventDetail.startDate)}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOnIcon />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                          }}
                        >
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
            <Card
              sx={{
                borderRadius: 3,
                height: 580,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardHeader
                title="Event Details"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}04)`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  flexShrink: 0
                }}
              />
              <CardContent
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 0,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    flexShrink: 0
                  }}
                >
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

                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 3
                  }}
                >
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
                                {eventDetail.mapLocationUrl &&
                                eventDetail.mapLocationUrl.trim() !== '' ? (
                                  <Button
                                    variant="text"
                                    sx={{
                                      p: 0,
                                      textTransform: 'none',
                                      textAlign: 'left',
                                      justifyContent: 'flex-start',
                                      minWidth: 'auto',
                                      '&:hover': {
                                        textDecoration: 'underline'
                                      }
                                    }}
                                    onClick={() =>
                                      window.open(
                                        eventDetail.mapLocationUrl,
                                        '_blank',
                                        'noopener,noreferrer'
                                      )
                                    }
                                  >
                                    <Typography
                                      variant="body1"
                                      fontWeight="medium"
                                      color="primary"
                                    >
                                      {eventDetail.address}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      , {eventDetail.city.name}
                                    </Typography>
                                  </Button>
                                ) : (
                                  <>
                                    <Typography
                                      variant="body1"
                                      fontWeight="medium"
                                    >
                                      {eventDetail.address}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {eventDetail.city.name}
                                    </Typography>
                                  </>
                                )}
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
                            <Card
                              variant="outlined"
                              sx={{
                                height: '100%',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[4]
                                }
                              }}
                            >
                              <CardContent>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="flex-start"
                                  mb={2}
                                >
                                  <Typography
                                    variant="h6"
                                    color="primary"
                                    fontWeight="bold"
                                  >
                                    {ticket.name}
                                  </Typography>
                                  <Chip
                                    label={`Qty: ${ticket.quantity}`}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                  />
                                </Box>

                                <Typography
                                  variant="h4"
                                  color="primary"
                                  fontWeight="bold"
                                  gutterBottom
                                >
                                  {formatPrice(ticket.price)}
                                </Typography>

                                {ticket.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                  >
                                    {ticket.description}
                                  </Typography>
                                )}

                                <Box mt={2}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Max Order:{' '}
                                    {ticket.max_order_quantity || 'Unlimited'}
                                  </Typography>
                                  {ticket.sales_start_date && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      Sales Start:{' '}
                                      {formatDate(ticket.sales_start_date)}
                                    </Typography>
                                  )}
                                  {ticket.sales_end_date && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                    >
                                      Sales End:{' '}
                                      {formatDate(ticket.sales_end_date)}
                                    </Typography>
                                  )}
                                </Box>
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
                                  <Box
                                    component="img"
                                    src={method.logo}
                                    alt={method.name}
                                    sx={{
                                      width: 60,
                                      height: 40,
                                      objectFit: 'contain',
                                      borderRadius: 1
                                    }}
                                  />
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
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Organizer Information */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                height: 275,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardHeader
                title="Event Organizer"
                action={
                  <Button
                    size="small"
                    onClick={() => setOrganizerDialogOpen(true)}
                  >
                    View Details
                  </Button>
                }
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.info.main}08, ${theme.palette.info.main}04)`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              />
              <CardContent sx={{ flex: 1 }}>
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
            <Card
              sx={{
                mt: 3,
                borderRadius: 3,
                height: 275,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardHeader
                title="Event Status"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main}08, ${theme.palette.success.main}04)`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              />
              <CardContent sx={{ flex: 1 }}>
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

      {/* Transaction History Section */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {/* Search Bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    placeholder="Search by visitor name..."
                    value={ticketFilters.search}
                    onChange={handleSearchChange}
                    size="small"
                    sx={{
                      minWidth: 300,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
                <Box>
                  <Tabs
                    value={listTabValue}
                    onChange={handleListTabChange}
                    aria-label="transaction/ticket list tabs"
                    sx={{
                      '& .MuiTab-root': {
                        minWidth: 120,
                        fontWeight: 600
                      }
                    }}
                  >
                    <Tab label="Transactions" />
                    <Tab label="Tickets" />
                  </Tabs>
                </Box>
              </Box>
            </Box>

            <TabPanel value={listTabValue} index={0}>
              {transactionsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Failed to load transactions
                  </Typography>
                  <Typography variant="body2">{transactionsError}</Typography>
                </Alert>
              )}
              {transactionsLoading && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <Typography>Loading transactions...</Typography>
                </Box>
              )}
              <TransactionsTable
                transactions={
                  transactionsData?.transactions?.map((transaction) => ({
                    id: transaction.id,
                    orderId: transaction.transactionNumber,
                    customerName: 'N/A', // Not available in transaction data
                    customerEmail: 'N/A', // Not available in transaction data
                    ticketType: transaction.ticketType.name,
                    quantity:
                      transaction.orderQuantity ||
                      transaction.ticketType.quantity,
                    totalAmount:
                      transaction.paymentBreakdown?.totalPrice ||
                      transaction.ticketType.price,
                    paymentMethod: transaction.paymentMethod.name,
                    status: (() => {
                      // Map transaction status to transaction status
                      switch (transaction.status.toLowerCase()) {
                        case 'success':
                        case 'completed':
                          return 'completed';
                        case 'pending':
                          return 'pending';
                        case 'cancelled':
                        case 'expired':
                          return 'cancelled';
                        case 'failed':
                          return 'failed';
                        default:
                          return 'pending';
                      }
                    })(),
                    transactionDate: transaction.createdAt,
                    paymentDate: transaction.createdAt,
                    paymentBreakdown: transaction.paymentBreakdown
                  })) || []
                }
                loading={transactionsLoading}
                onRefresh={mutateTransactions}
                pagination={transactionsData?.pagination}
                onPageChange={(newPage) => {
                  setTransactionFilters((prev) => ({
                    ...prev,
                    page: newPage
                  }));
                }}
                onLimitChange={(newLimit) => {
                  setTransactionFilters((prev) => ({
                    ...prev,
                    limit: newLimit,
                    page: 0
                  }));
                }}
              />
            </TabPanel>

            <TabPanel value={listTabValue} index={1}>
              {ticketsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Failed to load tickets
                  </Typography>
                  <Typography variant="body2">{ticketsError}</Typography>
                </Alert>
              )}
              {ticketsLoading && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <Typography>Loading tickets...</Typography>
                </Box>
              )}
              <TicketListTable
                tickets={tickets.map((ticket) => ({
                  id: ticket.id,
                  ticketNumber: ticket.ticket_id,
                  customerName: ticket.visitor_name,
                  customerEmail: 'N/A', // Not available in ticket data
                  ticketType: ticket.ticket_name,
                  price: 0, // Not available in ticket data
                  purchaseDate: ticket.created_at,
                  status: (() => {
                    // Map ticket status to TicketListTable status
                    switch (ticket.ticket_status.toLowerCase()) {
                      case 'active':
                      case 'issued':
                        return 'active';
                      case 'used':
                      case 'redeemed':
                        return 'used';
                      case 'expired':
                        return 'expired';
                      case 'cancelled':
                        return 'cancelled';
                      default:
                        return 'active';
                    }
                  })(),
                  usedDate:
                    ticket.redeemed_at || ticket.checked_in_at || undefined,
                  eventName: eventDetail.name,
                  seatNumber: undefined // Not available in ticket data
                }))}
                loading={ticketsLoading}
                onRefresh={mutateTickets}
                pagination={{
                  currentPage: ticketsCurrentPage,
                  totalItems: ticketsTotal,
                  limit: ticketsCurrentShow,
                  totalPages: Math.ceil(ticketsTotal / ticketsCurrentShow),
                  hasNext:
                    ticketsCurrentPage <
                    Math.ceil(ticketsTotal / ticketsCurrentShow) - 1,
                  hasPrev: ticketsCurrentPage > 0
                }}
                onPageChange={(newPage) => {
                  setTicketFilters((prev) => ({
                    ...prev,
                    page: newPage
                  }));
                }}
                onLimitChange={(newLimit) => {
                  setTicketFilters((prev) => ({
                    ...prev,
                    show: newLimit,
                    page: 0
                  }));
                }}
              />
            </TabPanel>
          </Grid>
        </Grid>
      </Container>

      {/* Organizer Details Dialog */}
      <Dialog
        open={organizerDialogOpen}
        onClose={() => setOrganizerDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Organizer Details</Typography>
            <IconButton onClick={() => setOrganizerDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {eventDetail.eventOrganizer.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {formatPhoneNumber(eventDetail.eventOrganizer.phone_number)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    PIC Name
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.event_organizer_pic ||
                      'Not specified'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    PIC Title
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.pic_title || 'Not specified'}
                  </Typography>
                </Box>
                {eventDetail.eventOrganizer.address && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {eventDetail.eventOrganizer.address}
                    </Typography>
                  </Box>
                )}
                {eventDetail.eventOrganizer.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {eventDetail.eventOrganizer.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Legal Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    NIK
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.nik || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    NPWP
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.npwp || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Social Media URL
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.social_media_url ||
                      'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Xenplatform ID
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.xenplatform_id ||
                      'Not provided'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Bank Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Bank Name
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.bank_information?.bank?.name ||
                      'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Number
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.bank_information
                      ?.accountNumber || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Holder Name
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.bank_information
                      ?.accountHolderName || 'Not provided'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}

EventDetail.getLayout = (page: ReactElement) => (
  <SidebarLayout>{page}</SidebarLayout>
);

export default EventDetail;
