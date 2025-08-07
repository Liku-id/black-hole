import { Event } from '@/types/event';
import { formatIndonesianDateTime, truncate } from '@/utils';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useRouter } from 'next/router';
import { ChangeEvent, FC, useState } from 'react';

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onRefresh?: () => void;
}

const EventsTable: FC<EventsTableProps> = ({
  events,
  loading = false,
  onRefresh
}) => {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const theme = useTheme();
  const router = useRouter();

  const handleSelectAllEvents = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedEvents(
      event.target.checked ? events.map((event) => event.id) : []
    );
  };

  const handleSelectOneEvent = (
    _event: ChangeEvent<HTMLInputElement>,
    eventId: string
  ): void => {
    if (!selectedEvents.includes(eventId)) {
      setSelectedEvents((prevSelected) => [...prevSelected, eventId]);
    } else {
      setSelectedEvents((prevSelected) =>
        prevSelected.filter((id) => id !== eventId)
      );
    }
  };

  const handlePageChange = (_event: any, newPage: number): void => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLimit(parseInt(event.target.value));
    setPage(0);
  };

  const handleRowClick = (event: Event) => {
    router.push(`/events/${event.metaUrl}`);
  };

  const handleActionClick = (
    e: React.MouseEvent,
    action: 'edit' | 'delete'
  ) => {
    e.stopPropagation(); // Prevent row click when clicking action buttons
    if (action === 'edit') {
      // Handle edit action
      console.log('Edit event');
    } else if (action === 'delete') {
      // Handle delete action
      console.log('Delete event');
    }
  };

  const paginatedEvents = events.slice(page * limit, page * limit + limit);
  const selectedSomeEvents =
    selectedEvents.length > 0 && selectedEvents.length < events.length;
  const selectedAllEvents = selectedEvents.length === events.length;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseInt(price));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Events" />
        <Divider />
        <Box p={3} display="flex" justifyContent="center">
          <Typography>Loading events...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        title={
          <Typography variant="body2" color="text.secondary">
            Total: {events.length} events
          </Typography>
        }
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        }
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}04)`,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      />
      <TableContainer sx={{ maxHeight: 800 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600
                }}
              >
                <Checkbox
                  color="primary"
                  checked={selectedAllEvents}
                  indeterminate={selectedSomeEvents}
                  onChange={handleSelectAllEvents}
                />
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 300
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Event Details
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 200
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Organizer & Location
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 180
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Ticket Info
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 150
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Payment Methods
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Created
                </Typography>
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 120
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEvents.map((event) => {
              const isEventSelected = selectedEvents.includes(event.id);
              const mainImage = event.eventAssets?.[0]?.asset?.url;

              return (
                <TableRow
                  hover
                  key={event.id}
                  selected={isEventSelected}
                  onClick={() => handleRowClick(event)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}08`,
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&.Mui-selected': {
                      backgroundColor: `${theme.palette.primary.main}12`
                    },
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <TableCell
                    padding="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      color="primary"
                      checked={isEventSelected}
                      onChange={(changeEvent: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneEvent(changeEvent, event.id)
                      }
                      value={isEventSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={mainImage}
                        sx={{
                          mr: 2,
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.primary.main,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        <EventIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          noWrap
                        >
                          {event.name}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          mt={0.5}
                        >
                          <EventIcon
                            sx={{
                              fontSize: 14,
                              color: theme.palette.text.secondary
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {event.eventType}
                          </Typography>
                        </Box>
                        {event.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {truncate(event.description, 40)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PersonIcon
                          sx={{ fontSize: 16, color: theme.palette.info.main }}
                        />
                        <Typography variant="body2" noWrap>
                          {event.eventOrganizerName}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOnIcon
                          sx={{
                            fontSize: 16,
                            color: theme.palette.success.main
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {event.city.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {truncate(event.address, 25)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {event.lowestPriceTicketType ? (
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="primary"
                        >
                          {formatPrice(event.lowestPriceTicketType.price)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {event.lowestPriceTicketType.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          Qty: {event.lowestPriceTicketType.quantity}
                        </Typography>
                      </Box>
                    ) : (
                      <Chip
                        label="No Tickets"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PaymentIcon
                          sx={{
                            fontSize: 16,
                            color: theme.palette.primary.main
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {event.paymentMethods.length} methods
                        </Typography>
                      </Box>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {event.paymentMethods
                          .slice(0, 3)
                          .map((method) => (
                            <Chip
                              key={method.id}
                              label={method.bank?.name || method.name}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.6rem',
                                height: 20,
                                borderRadius: 1
                              }}
                            />
                          ))}
                        {event.paymentMethods.length > 3 && (
                          <Chip
                            label={`+${event.paymentMethods.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.6rem',
                              height: 20,
                              borderRadius: 1
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {formatIndonesianDateTime(event.createdAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit Event" arrow>
                        <IconButton
                          onClick={(e) => handleActionClick(e, 'edit')}
                          sx={{
                            '&:hover': {
                              background: theme.colors.primary.lighter,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.primary.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
                        >
                          <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Event" arrow>
                        <IconButton
                          onClick={(e) => handleActionClick(e, 'delete')}
                          sx={{
                            '&:hover': {
                              background: theme.colors.error.lighter,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.error.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
                        >
                          <DeleteTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        p={2}
        sx={{
          backgroundColor: theme.palette.grey[50],
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <TablePagination
          component="div"
          count={events.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
              {
                fontWeight: 500
              }
          }}
        />
      </Box>
    </Card>
  );
};

export default EventsTable;
