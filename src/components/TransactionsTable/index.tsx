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

import { formatDateDDMMYYYY } from '@/utils';

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
  paymentBreakdown?: {
    basedPrice: number;
    fee: number;
    tax: number;
    totalPrice: number;
  };
}

interface TransactionsTableProps {
  transactions: Transaction[];
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
  onRefresh,
  pagination,
  onPageChange,
  onLimitChange
}) => {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );
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
    onPageChange?.(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newLimit = parseInt(event.target.value);
    onLimitChange?.(newLimit);
  };
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
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>Loading transactions...</Typography>
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
            Total: {transactions.length} transactions
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
                  checked={selectedAllTransactions}
                  color="primary"
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
                <Typography fontWeight="bold" variant="subtitle2">
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
                <Typography fontWeight="bold" variant="subtitle2">
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
                <Typography fontWeight="bold" variant="subtitle2">
                  Payment Info
                </Typography>
              </TableCell>

              <TableCell
                sx={{
                  backgroundColor: theme.palette.grey[50],
                  fontWeight: 600,
                  minWidth: 180
                }}
              >
                <Typography fontWeight="bold" variant="subtitle2">
                  Payment Breakdown
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
                <Typography fontWeight="bold" variant="subtitle2">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => {
              const isTransactionSelected = selectedTransactions.includes(
                transaction.id
              );
              return (
                <TableRow
                  key={transaction.id}
                  hover
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
                      checked={isTransactionSelected}
                      color="primary"
                      value={isTransactionSelected}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleSelectOneTransaction(event, transaction.id)
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
                          bgcolor: theme.palette.primary.main,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography
                          noWrap
                          fontWeight="bold"
                          variant="subtitle2"
                        >
                          {transaction.customerName}
                        </Typography>
                        <Typography
                          noWrap
                          color="text.secondary"
                          variant="caption"
                        >
                          {transaction.customerEmail}
                        </Typography>
                        <Box
                          alignItems="center"
                          display="flex"
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
                            noWrap
                            color="text.secondary"
                            variant="caption"
                          >
                            Order: {transaction.orderId}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography noWrap fontWeight="medium" variant="body2">
                        {transaction.ticketType}
                      </Typography>
                      <Typography
                        noWrap
                        color="text.secondary"
                        variant="caption"
                      >
                        Quantity: {transaction.quantity}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box alignItems="center" display="flex" gap={1} mb={1}>
                        <AccountBalanceIcon
                          sx={{ fontSize: 16, color: theme.palette.info.main }}
                        />
                        <Typography noWrap variant="body2">
                          {transaction.paymentMethod}
                        </Typography>
                      </Box>
                      {transaction.paymentDate && (
                        <Typography
                          noWrap
                          color="text.secondary"
                          variant="caption"
                        >
                          Paid: {formatDateDDMMYYYY(transaction.paymentDate)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    {transaction.paymentBreakdown ? (
                      <Box>
                        <Typography
                          color="text.secondary"
                          display="block"
                          variant="caption"
                        >
                          Base:{' '}
                          {formatPrice(transaction.paymentBreakdown.basedPrice)}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          display="block"
                          variant="caption"
                        >
                          Fee: {formatPrice(transaction.paymentBreakdown.fee)}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          display="block"
                          variant="caption"
                        >
                          Tax: {formatPrice(transaction.paymentBreakdown.tax)}
                        </Typography>
                        <Typography
                          color="success.main"
                          display="block"
                          fontWeight="bold"
                          variant="caption"
                        >
                          Total:{' '}
                          {formatPrice(transaction.paymentBreakdown.totalPrice)}
                        </Typography>
                        {transaction.refundAmount && (
                          <Typography
                            color="error"
                            display="block"
                            variant="caption"
                          >
                            Refund: {formatPrice(transaction.refundAmount)}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Typography
                          noWrap
                          color="primary"
                          fontWeight="bold"
                          variant="body2"
                        >
                          {formatPrice(transaction.totalAmount)}
                        </Typography>
                        {transaction.refundAmount && (
                          <Typography noWrap color="error" variant="caption">
                            Refund: {formatPrice(transaction.refundAmount)}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(transaction.status) as any}
                      label={getStatusLabel(transaction.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography noWrap fontWeight="medium" variant="body2">
                        {formatDateDDMMYYYY(transaction.transactionDate)}
                      </Typography>
                      {transaction.refundDate && (
                        <Typography
                          noWrap
                          color="text.secondary"
                          variant="caption"
                        >
                          Refund: {formatDateDDMMYYYY(transaction.refundDate)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip arrow title="View Details">
                        <IconButton
                          size="small"
                          sx={{
                            '&:hover': {
                              background: theme.palette.info.light,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.info.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <VisibilityTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title="Edit Transaction">
                        <IconButton
                          size="small"
                          sx={{
                            '&:hover': {
                              background: theme.palette.primary.light,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.primary.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title="Delete Transaction">
                        <IconButton
                          size="small"
                          sx={{
                            '&:hover': {
                              background: theme.palette.error.light,
                              transform: 'scale(1.1)'
                            },
                            color: theme.palette.error.main,
                            transition: 'all 0.2s ease-in-out'
                          }}
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

export default TransactionsTable;
