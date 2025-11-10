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
import { formatUtils, dateUtils } from '@/utils';

import { TransactionDetailModal } from '../detail-modal';

interface EventTransactionTableProps {
  transactions: any[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export const EventTransactionTable: FC<EventTransactionTableProps> = ({
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
              <TableCell width={"4%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  No.
                </Body2>
              </TableCell>
              <TableCell width={"16%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Name
                </Body2>
              </TableCell>
              <TableCell width={"11%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Type
                </Body2>
              </TableCell>
              <TableCell width={"9%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Ticket Qty
                </Body2>
              </TableCell>
              <TableCell width={"11%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Transaction ID
                </Body2>
              </TableCell>
              <TableCell width={"11%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Amount
                </Body2>
              </TableCell>
              <TableCell width={"10%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Payment
                </Body2>
              </TableCell>
              <TableCell width={"14%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Date
                </Body2>
              </TableCell>
              <TableCell width={"7%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Status
                </Body2>
              </TableCell>
              <TableCell width={"7%"}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box display="flex" justifyContent="center" padding="40px">
                    <Body2 color="text.secondary">No transactions found.</Body2>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction, index) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Body2>{index + 1 + currentPage * pageSize}.</Body2>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Body2
                      display="block"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {transaction.name}
                    </Body2>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Body2
                      display="block"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {transaction.ticketType?.name || '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>{transaction.orderQuantity || 0} Ticket</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>{transaction.transactionNumber || '-'}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>
                      {transaction.paymentBreakdown?.totalPrice
                        ? formatUtils.formatPrice(
                            transaction.paymentBreakdown.totalPrice
                          )
                        : '-'}
                    </Body2>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 0 }}>
                    <Body2
                      display="block"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {transaction.paymentMethod?.name || '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2>
                      {transaction.createdAt
                        ? dateUtils.formatDateDDMMYYYYHHMM(transaction.createdAt)
                        : '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status || 'UNKNOWN'} />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      sx={{ padding: '4px' }}
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
      <Pagination
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => onPageChange && onPageChange(page)}
        loading={loading}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={modalOpen}
        transaction={selectedTransaction}
        onClose={handleCloseModal}
      />
    </>
  );
};
