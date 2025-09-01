import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import { ChangeEvent, FC, useState } from 'react';

import { formatDateDDMMYYYY } from '@/utils';

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
  pagination?: {
    currentPage: number;
    totalItems: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange?: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
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
  onRefresh,
  pagination,
  onPageChange,
  onLimitChange
}) => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
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
    onPageChange?.(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newLimit = parseInt(event.target.value);
    onLimitChange?.(newLimit);
  };
  const selectedSomeTickets =
    selectedTickets.length > 0 && selectedTickets.length < tickets.length;
  const selectedAllTickets = selectedTickets.length === tickets.length;

  if (loading) {
    return (
      <Card>
        <CardHeader title="Ticket List" />
        <Divider />
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Loading tickets...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        action={
          <Button
            disabled={loading}
            size="small"
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2 }}
            variant="outlined"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        }
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.primary.main}04)`,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
        title={
          <Typography color="text.secondary" variant="body2">
            Total: {tickets.length} tickets
          </Typography>
        }
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
                  checked={selectedAllTickets}
                  color="primary"
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
                <Typography fontWeight="bold" variant="subtitle2">
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
                <Typography fontWeight="bold" variant="subtitle2">
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
                <Typography fontWeight="bold" variant="subtitle2">
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
                <Typography fontWeight="bold" variant="subtitle2">
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
                <Typography fontWeight="bold" variant="subtitle2">
                  Purchase Date
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => {
              const isTicketSelected = selectedTickets.includes(ticket.id);
              return (
                <TableRow
                  key={ticket.id}
                  hover
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
                      checked={isTicketSelected}
                      color="primary"
                      value={isTicketSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneTicket(event, ticket.id)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box alignItems="center" display="flex">
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
                          noWrap
                          fontWeight="bold"
                          variant="subtitle2"
                        >
                          {ticket.customerName}
                        </Typography>
                        <Typography
                          noWrap
                          color="text.secondary"
                          variant="caption"
                        >
                          {ticket.customerEmail}
                        </Typography>
                        <Box
                          alignItems="center"
                          display="flex"
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
                            noWrap
                            color="text.secondary"
                            variant="caption"
                          >
                            Ticket: {ticket.ticketNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography noWrap fontWeight="medium" variant="body2">
                        {ticket.ticketType}
                      </Typography>
                      <Typography
                        noWrap
                        color="text.secondary"
                        variant="caption"
                      >
                        Event: {ticket.eventName}
                      </Typography>
                      {ticket.seatNumber && (
                        <Typography
                          noWrap
                          color="text.secondary"
                          variant="caption"
                        >
                          Seat: {ticket.seatNumber}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      noWrap
                      color="primary"
                      fontWeight="bold"
                      variant="body2"
                    >
                      {formatPrice(ticket.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(ticket.status) as any}
                      label={getStatusLabel(ticket.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography noWrap fontWeight="medium" variant="body2">
                        {formatDateDDMMYYYY(ticket.purchaseDate)}
                      </Typography>
                      {ticket.usedDate && (
                        <Typography
                          noWrap
                          color="text.secondary"
                          variant="caption"
                        >
                          Used: {formatDateDDMMYYYY(ticket.usedDate)}
                        </Typography>
                      )}
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
        {pagination && (
          <TablePagination
            component="div"
            count={pagination.totalItems}
            page={pagination.currentPage}
            rowsPerPage={pagination.limit}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                {
                  fontWeight: 500
                }
            }}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleLimitChange}
          />
        )}
      </Box>
    </Card>
  );
};

export default TicketListTable;
