import {
  Box,
  IconButton,
  Table,
  TableCell,
  TableRow
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';

import {
  Body2,
  CollapsibleCardList,
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody,
  Pagination
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

  const [filters, setFilters] = useState<{ page: number; show: number }>({
    page: 0,
    show: 10
  });

  const {
    summaries,
    loading: summariesLoading,
    error,
    pagination: paginationData
  } = useWithdrawalSummaries(filters);

  const isLoading = loading || summariesLoading;

  const handleViewTransaction = (eventId: string) => {
    router.push(`/finance/event-transactions/${eventId}`);
  };

  const renderActionCell = (summary: (typeof summaries)[number]) => (
    <IconButton
      size="small"
      sx={{ padding: '4px' }}
      onClick={() => handleViewTransaction(summary.eventId)}
    >
      <Image alt="View" height={16} src="/icon/eye.svg" width={16} />
    </IconButton>
  );

  if (error) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="error.main">Error loading transactions: {error}</Body2>
      </Box>
    );
  }

  const paginationNode = (
    <Pagination
      total={paginationData?.totalRecords}
      currentPage={filters.page}
      pageSize={filters.show}
      onPageChange={(page) => {
        setFilters((prev) => ({ ...prev, page }));
      }}
      loading={isLoading}
    />
  );

  return (
    <>
      <StyledTableContainer sx={{ display: { xs: 'block', lg: 'none' } }}>
        <CollapsibleCardList
          items={summaries}
          getKey={(summary) => summary.eventId}
          loading={isLoading}
          loadingMessage="Loading transactions..."
          emptyMessage="No transactions found."
          renderTitle={(summary, index) =>
            `${index + 1 + filters.page * filters.show}. ${summary.eventName}`
          }
          renderDetails={(summary) => [
            {
              label: 'Status Event',
              value: <StatusBadge status={summary.eventStatus} />
            },
            {
              label: 'Total Revenue',
              value: formatUtils.formatPrice(parseFloat(summary.totalAmount))
            },
            {
              label: 'Available Balance',
              value: formatUtils.formatPrice(
                parseFloat(summary.availableAmount)
              )
            },
            {
              label: 'Amount Pending',
              value: formatUtils.formatPrice(
                parseFloat(summary.pendingSettlementAmount)
              )
            }
          ]}
          renderActions={renderActionCell}
        />
        {paginationNode}
      </StyledTableContainer>

      <StyledTableContainer sx={{ display: { xs: 'none', lg: 'block' } }}>
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} sx={{ border: 'none' }}>
                <Box display="flex" justifyContent="center" padding="40px">
                  <Body2 color="text.secondary">Loading transactions...</Body2>
                </Box>
              </TableCell>
            </TableRow>
          ) : summaries.length === 0 ? (
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
                  <Body2>{index + 1 + filters.page * filters.show}.</Body2>
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
                <TableCell>{renderActionCell(summary)}</TableCell>
              </TableRow>
            ))
          )}
        </StyledTableBody>
      </Table>

      {paginationNode}
      </StyledTableContainer>
    </>
  );
};
