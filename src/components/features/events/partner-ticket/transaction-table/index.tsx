import { Box, Table, TableCell, TableRow, IconButton } from '@mui/material';
import Image from 'next/image';
import { FC, useState } from 'react';

import {
  Body2,
  CollapsibleCardList,
  Pagination,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { TransactionDetailModal } from '@/components/features/finance/transaction/detail-modal';
import { formatUtils } from '@/utils';

interface PartnerTransactionTableProps {
  transactions: any[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export const PartnerTransactionTable: FC<PartnerTransactionTableProps> = ({
  transactions,
  loading = false,
  error = null,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  onPageChange
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
  };

  const getAmount = (transaction: any) =>
    transaction.paymentBreakdown?.totalPrice
      ? formatUtils.formatPrice(transaction.paymentBreakdown.totalPrice)
      : '-';

  const renderActionCell = (transaction: any) => (
    <IconButton
      size="small"
      sx={{ padding: '4px', color: 'primary.main' }}
      onClick={() => handleViewTransaction(transaction)}
    >
      <Image alt="View" height={16} src="/icon/eye.svg" width={16} />
    </IconButton>
  );

  const renderTransactionDetails = (transaction: any) => [
    { label: 'Name', value: transaction.name || '-' },
    { label: 'Ticket Type', value: transaction.ticketType?.name || '-' },
    {
      label: 'Ticket Amount',
      value: `${transaction.orderQuantity || 0} Ticket`
    },
    { label: 'Order ID', value: transaction.transactionNumber || '-' },
    { label: 'Amount', value: getAmount(transaction) },
    {
      label: 'Payment Method',
      value: transaction.paymentMethod?.name || '-'
    },
    {
      label: 'Status Payment',
      value: <StatusBadge status={transaction.status || 'UNKNOWN'} />
    }
  ];

  if (error) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="error.main">Error loading transactions: {error}</Body2>
      </Box>
    );
  }

  const pagination =
    transactions.length > 0 ? (
      <Pagination
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => onPageChange && onPageChange(page)}
        loading={loading}
      />
    ) : null;

  return (
    <>
      <StyledTableContainer sx={{ display: { xs: 'block', lg: 'none' } }}>
        <CollapsibleCardList
          items={transactions}
          getKey={(transaction) => transaction.id}
          loading={loading}
          loadingMessage="Loading transactions..."
          emptyMessage="No transactions found."
          renderTitle={(transaction, index) =>
            `${index + 1 + currentPage * pageSize}. ${transaction.name || '-'}`
          }
          renderSubtitle={(transaction) =>
            transaction.ticketType?.name || transaction.transactionNumber || '-'
          }
          renderTitleMeta={(transaction) => (
            <StatusBadge status={transaction.status || 'UNKNOWN'} />
          )}
          renderDetails={renderTransactionDetails}
          renderActions={renderActionCell}
        />
        {pagination}
      </StyledTableContainer>

      <StyledTableContainer
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiTable-root': {
            minWidth: { xs: '720px', md: '100%' }
          }
        }}
      >
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  No
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Type
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Amount
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Order ID
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Amount
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Payment Method
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Status Payment
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '8%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ padding: '40px' }}>
                  <Body2 color="text.secondary">Loading transactions...</Body2>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ padding: '40px' }}>
                  <Body2 color="text.secondary">No transactions found.</Body2>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {index + 1 + currentPage * pageSize}.
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2
                      color="text.primary"
                      fontSize="14px"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px'
                      }}
                    >
                      {transaction.name || '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2
                      color="text.primary"
                      fontSize="14px"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '150px'
                      }}
                    >
                      {transaction.ticketType?.name || '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {transaction.orderQuantity || 0} Ticket
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {transaction.transactionNumber || '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 color="text.primary" fontSize="14px">
                      {getAmount(transaction)}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2
                      color="text.primary"
                      fontSize="14px"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '150px'
                      }}
                    >
                      {transaction.paymentMethod?.name || '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status || 'UNKNOWN'} />
                  </TableCell>
                  <TableCell>{renderActionCell(transaction)}</TableCell>
                </TableRow>
              ))
            )}
          </StyledTableBody>
        </Table>
        {pagination}
      </StyledTableContainer>

      <TransactionDetailModal
        open={modalOpen}
        transaction={selectedTransaction}
        onClose={handleCloseModal}
      />
    </>
  );
};
