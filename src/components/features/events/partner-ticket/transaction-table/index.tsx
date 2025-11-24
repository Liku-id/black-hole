import { Box, Table, TableCell, TableRow, IconButton } from '@mui/material';
import Image from 'next/image';
import { FC, useState } from 'react';

import {
  Body2,
  Pagination,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { formatUtils } from '@/utils';
import { TransactionDetailModal } from '@/components/features/finance/transaction/detail-modal';

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="text.secondary">Loading transactions...</Body2>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="error.main">Error loading transactions: {error}</Body2>
      </Box>
    );
  }

  return (
    <>
      <StyledTableContainer>
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
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box display="flex" justifyContent="center" padding="40px">
                    <Body2 color="text.secondary">No transactions found.</Body2>
                  </Box>
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
                      {transaction.paymentBreakdown?.totalPrice
                        ? formatUtils.formatPrice(
                            transaction.paymentBreakdown.totalPrice
                          )
                        : '-'}
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
                  <TableCell>
                    <IconButton
                      size="small"
                      sx={{ padding: '4px', color: 'primary.main' }}
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <Image
                        alt="View"
                        height={16}
                        src="/icon/eye.svg"
                        width={16}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>

      {/* Pagination */}
      {transactions.length > 0 && (
        <Pagination
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(page) => onPageChange && onPageChange(page)}
          loading={loading}
        />
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={modalOpen}
        transaction={selectedTransaction}
        onClose={handleCloseModal}
      />
    </>
  );
};
