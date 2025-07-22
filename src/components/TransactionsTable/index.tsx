import { formatIndonesianDateTime } from '@/utils';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import PaymentIcon from '@mui/icons-material/Payment';
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

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  transactionDate: string;
  paymentDate?: string;
  refundAmount?: number;
  refundDate?: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  loading?: boolean;
  onRefresh?: () => void;
}

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
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

const TransactionsTable: FC<TransactionsTableProps> = ({
  transactions,
  loading = false,
  onRefresh
}) => {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const theme = useTheme();

  const handleSelectAllTransactions = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setSelectedTransactions(
      event.target.checked
        ? transactions.map((transaction) => transaction.id)
        : []
    );
  };

  const handleSelectOneTransaction = (
    _event: ChangeEvent<HTMLInputElement>,
    transactionId: string
  ): void => {
    if (!selectedTransactions.includes(transactionId)) {
      setSelectedTransactions((prevSelected) => [
        ...prevSelected,
        transactionId
      ]);
    } else {
      setSelectedTransactions((prevSelected) =>
        prevSelected.filter((id) => id !== transactionId)
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

  const paginatedTransactions = transactions.slice(
    page * limit,
    page * limit + limit
  );
  const selectedSomeTransactions =
    selectedTransactions.length > 0 &&
    selectedTransactions.length < transactions.length;
  const selectedAllTransactions =
    selectedTransactions.length === transactions.length;

  if (loading) {
    return (
      <Card>
        <CardHeader title="Transaction History" />
        <Divider />
        <Box p={3} display="flex" justifyContent="center">
          <Typography>Loading transactions...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardHeader
        title={
          <Typography variant="body2" color="text.secondary">
            Total: {transactions.length} transactions
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
                  checked={selectedAllTransactions}
                  indeterminate={selectedSomeTransactions}
                  onChange={handleSelectAllTransactions}
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
                  Customer & Order
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
                  minWidth: 180
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Payment Info
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
                  Amount
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
                  Date
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
            {paginatedTransactions.map((transaction) => {
              const isTransactionSelected = selectedTransactions.includes(
                transaction.id
              );
              return (
                <TableRow
                  hover
                  key={transaction.id}
                  selected={isTransactionSelected}
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
                      checked={isTransactionSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneTransaction(event, transaction.id)
                      }
                      value={isTransactionSelected}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          mr: 2,
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.primary.main,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          noWrap
                        >
                          {transaction.customerName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {transaction.customerEmail}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          mt={0.5}
                        >
                          <PaymentIcon
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
                            Order: {transaction.orderId}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {transaction.ticketType}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        Quantity: {transaction.quantity}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AccountBalanceIcon
                          sx={{ fontSize: 16, color: theme.palette.info.main }}
                        />
                        <Typography variant="body2" noWrap>
                          {transaction.paymentMethod}
                        </Typography>
                      </Box>
                      {transaction.paymentDate && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          Paid:{' '}
                          {formatIndonesianDateTime(transaction.paymentDate)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary"
                        noWrap
                      >
                        {formatPrice(transaction.totalAmount)}
                      </Typography>
                      {transaction.refundAmount && (
                        <Typography variant="caption" color="error" noWrap>
                          Refund: {formatPrice(transaction.refundAmount)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(transaction.status)}
                      color={getStatusColor(transaction.status) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {formatIndonesianDateTime(transaction.transactionDate)}
                      </Typography>
                      {transaction.refundDate && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          Refund:{' '}
                          {formatIndonesianDateTime(transaction.refundDate)}
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
                      <Tooltip title="Edit Transaction" arrow>
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
                      <Tooltip title="Delete Transaction" arrow>
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
          count={transactions.length}
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

export default TransactionsTable;
