import { Box, IconButton, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC } from 'react';

import {
  Body2,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common';
import { StatusBadge } from '@/components/features/events/status-badge';
import { useWithdrawalSummaries } from '@/hooks';
import { formatUtils } from '@/utils';

interface FinanceTransactionTableProps {
  loading?: boolean;
}

export const FinanceTransactionTable: FC<FinanceTransactionTableProps> = ({
  loading = false
}) => {
  const router = useRouter();
  const {
    summaries,
    loading: summariesLoading,
    error
  } = useWithdrawalSummaries();

  const handleViewTransaction = (eventId: string) => {
    router.push(`/finance/event-transactions/${eventId}`);
  };

  if (loading || summariesLoading) {
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
    <StyledTableContainer>
      <Table>
        <StyledTableHead>
          <TableRow>
            <TableCell sx={{ width: '5%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                No.
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '25%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Event Name
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '15%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Status Event
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '15%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Total Revenue
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '15%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Available Balance
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '15%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Amount Pending
              </Body2>
            </TableCell>
            <TableCell sx={{ width: '10%' }}>
              <Body2 color="text.secondary" fontSize="14px">
                Action
              </Body2>
            </TableCell>
          </TableRow>
        </StyledTableHead>
        <StyledTableBody>
          {summaries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Box display="flex" justifyContent="center" padding="40px">
                  <Body2 color="text.secondary">No transactions found.</Body2>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            summaries.map((summary, index) => (
              <TableRow key={summary.eventId}>
                <TableCell>
                  <Body2>{index + 1}.</Body2>
                </TableCell>
                <TableCell>
                  <Body2>{summary.eventName}</Body2>
                </TableCell>
                <TableCell>
                  <StatusBadge status={summary.eventStatus} />
                </TableCell>
                <TableCell>
                  <Body2>
                    {formatUtils.formatPrice(parseFloat(summary.totalAmount))}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2>
                    {formatUtils.formatPrice(
                      parseFloat(summary.availableAmount)
                    )}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2>
                    {formatUtils.formatPrice(
                      parseFloat(summary.pendingSettlementAmount)
                    )}
                  </Body2>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    sx={{ padding: '4px' }}
                    onClick={() => handleViewTransaction(summary.eventId)}
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
  );
};
