import { formatIndonesianDateTime } from '@/utils';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
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
import { ChangeEvent, FC, useState } from 'react';

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  ticketType: string;
  price: number;
  purchaseDate: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  usedDate?: string;
  eventName: string;
  seatNumber?: string;
  qrCode?: string;
}

interface TicketListTableProps {
  tickets: Ticket[];
  loading?: boolean;
  onRefresh?: () => void;
}

const getStatusColor = (status: Ticket['status']) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'used':
      return 'info';
    case 'expired':
      return 'error';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: Ticket['status']) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'used':
      return 'Used';
    case 'expired':
      return 'Expired';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const TicketListTable: FC<TicketListTableProps> = ({
  tickets,
  loading = false,
  onRefresh
}) => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const theme = useTheme();

  const handleSelectAllTickets = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedTickets(
      event.target.checked ? tickets.map((ticket) => ticket.id) : []
    );
  };

  const handleSelectOneTicket = (
    _event: ChangeEvent<HTMLInputElement>,
    ticketId: string
  ): void => {
    if (!selectedTickets.includes(ticketId)) {
      setSelectedTickets((prevSelected) => [...prevSelected, ticketId]);
    } else {
      setSelectedTickets((prevSelected) =>
        prevSelected.filter((id) => id !== ticketId)
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

  const paginatedTickets = tickets.slice(page * limit, page * limit + limit);
  const selectedSomeTickets =
    selectedTickets.length > 0 && selectedTickets.length < tickets.length;
  const selectedAllTickets = selectedTickets.length === tickets.length;

  if (loading) {
    return (
      <Card>
        <CardHeader title="Ticket List" />
        <Divider />
        <Box p={3} display="flex" justifyContent="center">
          <Typography>Loading tickets...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        title={
          <Typography variant="body2" color="text.secondary">
            Total: {tickets.length} tickets
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
                  checked={selectedAllTickets}
                  indeterminate={selectedSomeTickets}
                  onChange={handleSelectAllTickets}
                />
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 280
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Customer & Ticket
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
                  Ticket Details
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
                  Price
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
                  Status
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
                  Purchase Date
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
            {paginatedTickets.map((ticket) => {
              const isTicketSelected = selectedTickets.includes(ticket.id);
              return (
                <TableRow
                  hover
                  key={ticket.id}
                  selected={isTicketSelected}
                  sx={{
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isTicketSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneTicket(event, ticket.id)
                      }
                      value={isTicketSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          mr: 2,
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.secondary.main,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        <ConfirmationNumberIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          noWrap
                        >
                          {ticket.customerName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {ticket.customerEmail}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          mt={0.5}
                        >
                          <PersonIcon
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
                            Ticket: {ticket.ticketNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {ticket.ticketType}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        Event: {ticket.eventName}
                      </Typography>
                      {ticket.seatNumber && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          Seat: {ticket.seatNumber}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary"
                      noWrap
                    >
                      {formatPrice(ticket.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(ticket.status)}
                      color={getStatusColor(ticket.status) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {formatIndonesianDateTime(ticket.purchaseDate)}
                      </Typography>
                      {ticket.usedDate && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          Used: {formatIndonesianDateTime(ticket.usedDate)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          sx={{
                            '&:hover': {
                              background: theme.colors.info.lighter,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.info.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                          size="small"
                        >
                          <VisibilityTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Ticket" arrow>
                        <IconButton
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
                      <Tooltip title="Delete Ticket" arrow>
                        <IconButton
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
          count={tickets.length}
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

export default TicketListTable;
