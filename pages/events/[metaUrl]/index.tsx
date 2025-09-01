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
  useTheme
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';

import TicketListTable from '@/components/features/tickets/table';
import TransactionsTable from '@/components/TransactionsTable';
import { useEventDetail, useTickets, useTransactions } from '@/hooks';
import DashboardLayout from '@/layouts/dashboard';
import { dateUtils, formatPrice, formatPhoneNumber } from '@/utils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      aria-labelledby={`event-tab-${index}`}
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      role="tabpanel"
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleListTabChange = (
    _event: React.SyntheticEvent,
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
      <DashboardLayout>
        <Head>
          <title>Loading Event - Wukong Backoffice</title>
        </Head>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Skeleton height={200} variant="rectangular" />
                  <Box sx={{ mt: 2 }}>
                    <Skeleton height={40} variant="text" />
                    <Skeleton height={20} variant="text" />
                    <Skeleton height={20} variant="text" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </DashboardLayout>
    );
  }

  if (error || !eventDetail) {
    return (
      <DashboardLayout>
        <Head>
          <title>Event Not Found - Wukong Backoffice</title>
        </Head>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography gutterBottom variant="subtitle2">
                  Failed to load event
                </Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
              <Button
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                onClick={() => router.push('/events')}
              >
                Back to Events
              </Button>
            </Grid>
          </Grid>
        </Container>
      </DashboardLayout>
    );
  }

  const mainImage = eventDetail.eventAssets?.[0]?.asset?.url;

  return (
    <>
      <Head>
        <title>{eventDetail.name} - Wukong Backoffice</title>
      </Head>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: 2 }}
          variant="outlined"
          onClick={() => router.push('/events')}
        >
          Back to Events
        </Button>
      </Box>

      <Container maxWidth="lg">
        <Grid container alignItems="stretch" spacing={3}>
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
                <Grid container alignItems="center" spacing={3}>
                  <Grid item md={8} xs={12}>
                    <Typography
                      gutterBottom
                      fontWeight="bold"
                      sx={{
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}
                      variant="h3"
                    >
                      {eventDetail.name}
                    </Typography>
                    <Chip
                      color="primary"
                      label={eventDetail.eventType}
                      sx={{
                        mb: 2,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                    <Typography
                      sx={{
                        opacity: 0.9,
                        mb: 2,
                        color: 'white',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                      }}
                      variant="h6"
                    >
                      {eventDetail.description}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} spacing={2}>
                      <Box alignItems="center" display="flex" gap={1}>
                        <CalendarTodayIcon />
                        <Typography
                          sx={{
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                          }}
                          variant="body2"
                        >
                          {formatDate(eventDetail.startDate)}
                        </Typography>
                      </Box>
                      <Box alignItems="center" display="flex" gap={1}>
                        <LocationOnIcon />
                        <Typography
                          sx={{
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                          }}
                          variant="body2"
                        >
                          {eventDetail.city.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item md={4} textAlign="right" xs={12}>
                    <Stack
                      direction="row"
                      justifyContent="flex-end"
                      spacing={1}
                    >
                      <IconButton
                        sx={{
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }}
                        onClick={mutate}
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
          <Grid item md={8} xs={12}>
            <Card
              sx={{
                borderRadius: 3,
                height: 580,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardHeader
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}04)`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  flexShrink: 0
                }}
                title="Event Details"
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
                    aria-label="event tabs"
                    value={tabValue}
                    onChange={handleTabChange}
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
                  <TabPanel index={0} value={tabValue}>
                    <Grid container spacing={3}>
                      <Grid item md={6} xs={12}>
                        <Box sx={{ mb: 3 }}>
                          <Typography gutterBottom variant="h6">
                            Event Information
                          </Typography>
                          <Stack spacing={2}>
                            <Box alignItems="center" display="flex" gap={2}>
                              <EventIcon color="primary" />
                              <Box>
                                <Typography
                                  color="text.secondary"
                                  variant="body2"
                                >
                                  Event Type
                                </Typography>
                                <Typography fontWeight="medium" variant="body1">
                                  {eventDetail.eventType}
                                </Typography>
                              </Box>
                            </Box>
                            <Box alignItems="center" display="flex" gap={2}>
                              <CalendarTodayIcon color="primary" />
                              <Box>
                                <Typography
                                  color="text.secondary"
                                  variant="body2"
                                >
                                  Start Date
                                </Typography>
                                <Typography fontWeight="medium" variant="body1">
                                  {formatDate(eventDetail.startDate)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box alignItems="center" display="flex" gap={2}>
                              <AccessTimeIcon color="primary" />
                              <Box>
                                <Typography
                                  color="text.secondary"
                                  variant="body2"
                                >
                                  End Date
                                </Typography>
                                <Typography fontWeight="medium" variant="body1">
                                  {formatDate(eventDetail.endDate)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box alignItems="center" display="flex" gap={2}>
                              <LocationOnIcon color="primary" />
                              <Box>
                                <Typography
                                  color="text.secondary"
                                  variant="body2"
                                >
                                  Location
                                </Typography>
                                {eventDetail.mapLocationUrl &&
                                eventDetail.mapLocationUrl.trim() !== '' ? (
                                  <Button
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
                                    variant="text"
                                    onClick={() =>
                                      window.open(
                                        eventDetail.mapLocationUrl,
                                        '_blank',
                                        'noopener,noreferrer'
                                      )
                                    }
                                  >
                                    <Typography
                                      color="primary"
                                      fontWeight="medium"
                                      variant="body1"
                                    >
                                      {eventDetail.address}
                                    </Typography>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
                                    >
                                      , {eventDetail.city.name}
                                    </Typography>
                                  </Button>
                                ) : (
                                  <>
                                    <Typography
                                      fontWeight="medium"
                                      variant="body1"
                                    >
                                      {eventDetail.address}
                                    </Typography>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
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
                      <Grid item md={6} xs={12}>
                        <Box sx={{ mb: 3 }}>
                          <Typography gutterBottom variant="h6">
                            Description
                          </Typography>
                          <Typography color="text.secondary" variant="body1">
                            {eventDetail.description}
                          </Typography>
                        </Box>
                        {eventDetail.websiteUrl && (
                          <Box>
                            <Typography gutterBottom variant="h6">
                              Website
                            </Typography>
                            <Button
                              href={eventDetail.websiteUrl}
                              rel="noopener noreferrer"
                              startIcon={<LanguageIcon />}
                              target="_blank"
                              variant="outlined"
                            >
                              Visit Website
                            </Button>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </TabPanel>

                  <TabPanel index={1} value={tabValue}>
                    <Typography gutterBottom variant="h6">
                      Ticket Types
                    </Typography>
                    {eventDetail.ticketTypes.length > 0 ? (
                      <Grid container spacing={2}>
                        {eventDetail.ticketTypes.map((ticket) => (
                          <Grid key={ticket.id} item md={6} xs={12}>
                            <Card
                              sx={{
                                height: '100%',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[4]
                                }
                              }}
                              variant="outlined"
                            >
                              <CardContent>
                                <Box
                                  alignItems="flex-start"
                                  display="flex"
                                  justifyContent="space-between"
                                  mb={2}
                                >
                                  <Typography
                                    color="primary"
                                    fontWeight="bold"
                                    variant="h6"
                                  >
                                    {ticket.name}
                                  </Typography>
                                  <Chip
                                    color="info"
                                    label={`Qty: ${ticket.quantity}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>

                                <Typography
                                  gutterBottom
                                  color="primary"
                                  fontWeight="bold"
                                  variant="h4"
                                >
                                  {formatPrice(ticket.price)}
                                </Typography>

                                {ticket.description && (
                                  <Typography
                                    gutterBottom
                                    color="text.secondary"
                                    variant="body2"
                                  >
                                    {ticket.description}
                                  </Typography>
                                )}

                                <Box mt={2}>
                                  <Typography
                                    color="text.secondary"
                                    display="block"
                                    variant="caption"
                                  >
                                    Max Order:{' '}
                                    {ticket.max_order_quantity || 'Unlimited'}
                                  </Typography>
                                  {ticket.sales_start_date && (
                                    <Typography
                                      color="text.secondary"
                                      display="block"
                                      variant="caption"
                                    >
                                      Sales Start:{' '}
                                      {formatDate(ticket.sales_start_date)}
                                    </Typography>
                                  )}
                                  {ticket.sales_end_date && (
                                    <Typography
                                      color="text.secondary"
                                      display="block"
                                      variant="caption"
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
                      <Typography color="text.secondary" variant="body1">
                        No ticket types available for this event.
                      </Typography>
                    )}
                  </TabPanel>

                  <TabPanel index={2} value={tabValue}>
                    <Typography gutterBottom variant="h6">
                      Payment Methods
                    </Typography>
                    {eventDetail.paymentMethods.length > 0 ? (
                      <Grid container spacing={2}>
                        {eventDetail.paymentMethods.map((method) => (
                          <Grid key={method.id} item md={4} xs={12}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box alignItems="center" display="flex" gap={2}>
                                  <Box
                                    alt={method.name}
                                    component="img"
                                    src={method.logo}
                                    sx={{
                                      width: 60,
                                      height: 40,
                                      objectFit: 'contain',
                                      borderRadius: 1
                                    }}
                                  />
                                  <Box>
                                    <Typography
                                      fontWeight="medium"
                                      variant="subtitle1"
                                    >
                                      {method.name}
                                    </Typography>
                                    <Typography
                                      color="text.secondary"
                                      variant="body2"
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
                      <Typography color="text.secondary" variant="body1">
                        No payment methods available for this event.
                      </Typography>
                    )}
                  </TabPanel>

                  <TabPanel index={3} value={tabValue}>
                    <Typography gutterBottom variant="h6">
                      Terms & Conditions
                    </Typography>
                    <Typography color="text.secondary" variant="body1">
                      {eventDetail.termAndConditions ||
                        'No terms and conditions available.'}
                    </Typography>
                  </TabPanel>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Organizer Information */}
          <Grid item md={4} xs={12}>
            <Card
              sx={{
                borderRadius: 3,
                height: 275,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardHeader
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
                title="Event Organizer"
              />
              <CardContent sx={{ flex: 1 }}>
                <Box alignItems="center" display="flex" gap={2} mb={3}>
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
                    <Typography fontWeight="bold" variant="h6">
                      {eventDetail.eventOrganizer.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Event Organizer
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box alignItems="center" display="flex" gap={2}>
                    <EmailIcon color="info" />
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {eventDetail.eventOrganizer.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box alignItems="center" display="flex" gap={2}>
                    <PhoneIcon color="info" />
                    <Box>
                      <Typography color="text.secondary" variant="body2">
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
                    <Box alignItems="center" display="flex" gap={2}>
                      <LocationOnIcon color="info" />
                      <Box>
                        <Typography color="text.secondary" variant="body2">
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
                        gutterBottom
                        color="text.secondary"
                        variant="body2"
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
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main}08, ${theme.palette.success.main}04)`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
                title="Event Status"
              />
              <CardContent sx={{ flex: 1 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Status
                    </Typography>
                    <Chip
                      color="success"
                      label={eventDetail.eventStatus}
                      sx={{ mt: 1 }}
                      variant="outlined"
                    />
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Admin Fee
                    </Typography>
                    <Typography color="primary" fontWeight="bold" variant="h6">
                      {eventDetail.adminFee}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Created
                    </Typography>
                    <Typography variant="body1">
                      {dateUtils.formatDateDDMMYYYY(eventDetail.createdAt)}
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                    placeholder="Search by visitor name..."
                    size="small"
                    sx={{
                      minWidth: 300,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white'
                      }
                    }}
                    value={ticketFilters.search}
                    onChange={handleSearchChange}
                  />
                </Box>
                <Box>
                  <Tabs
                    aria-label="transaction/ticket list tabs"
                    sx={{
                      '& .MuiTab-root': {
                        minWidth: 120,
                        fontWeight: 600
                      }
                    }}
                    value={listTabValue}
                    onChange={handleListTabChange}
                  >
                    <Tab label="Transactions" />
                    <Tab label="Tickets" />
                  </Tabs>
                </Box>
              </Box>
            </Box>

            <TabPanel index={0} value={listTabValue}>
              {transactionsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography gutterBottom variant="subtitle2">
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
                loading={transactionsLoading}
                pagination={transactionsData?.pagination}
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
                onLimitChange={(newLimit) => {
                  setTransactionFilters((prev) => ({
                    ...prev,
                    limit: newLimit,
                    page: 0
                  }));
                }}
                onPageChange={(newPage) => {
                  setTransactionFilters((prev) => ({
                    ...prev,
                    page: newPage
                  }));
                }}
                onRefresh={mutateTransactions}
              />
            </TabPanel>

            <TabPanel index={1} value={listTabValue}>
              {ticketsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography gutterBottom variant="subtitle2">
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
                loading={ticketsLoading}
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
                onLimitChange={(newLimit) => {
                  setTicketFilters((prev) => ({
                    ...prev,
                    show: newLimit,
                    page: 0
                  }));
                }}
                onPageChange={(newPage) => {
                  setTicketFilters((prev) => ({
                    ...prev,
                    page: newPage
                  }));
                }}
                onRefresh={mutateTickets}
              />
            </TabPanel>
          </Grid>
        </Grid>
      </Container>

      {/* Organizer Details Dialog */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={organizerDialogOpen}
        onClose={() => setOrganizerDialogOpen(false)}
      >
        <DialogTitle>
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Typography variant="h6">Organizer Details</Typography>
            <IconButton onClick={() => setOrganizerDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography gutterBottom variant="h6">
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Name
                  </Typography>
                  <Typography fontWeight="medium" variant="body1">
                    {eventDetail.eventOrganizer.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {formatPhoneNumber(eventDetail.eventOrganizer.phone_number)}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    PIC Name
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.event_organizer_pic?.name ||
                      'Not specified'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    PIC Title
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.pic_title || 'Not specified'}
                  </Typography>
                </Box>
                {eventDetail.eventOrganizer.address && (
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {eventDetail.eventOrganizer.address}
                    </Typography>
                  </Box>
                )}
                {eventDetail.eventOrganizer.description && (
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {eventDetail.eventOrganizer.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
            <Grid item md={4} xs={12}>
              <Typography gutterBottom variant="h6">
                Legal Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    NIK
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.nik || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    NPWP
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.npwp || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Social Media URL
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.social_media_url ||
                      'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Xenplatform ID
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.xenplatform_id ||
                      'Not provided'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item md={4} xs={12}>
              <Typography gutterBottom variant="h6">
                Bank Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Bank Name
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.bank_information?.bank?.name ||
                      'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Account Number
                  </Typography>
                  <Typography variant="body1">
                    {eventDetail.eventOrganizer.bank_information
                      ?.accountNumber || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
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
    </>
  );
}

EventDetail.getLayout = (page: ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default EventDetail;
