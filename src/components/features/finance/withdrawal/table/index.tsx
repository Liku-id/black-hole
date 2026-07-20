import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  IconButton,
  Table,
  TableCell,
  TableRow,
  useTheme
} from '@mui/material';
import { FC, ReactNode, useState } from 'react';

import {
  Body1,
  Body2,
  Caption,
  CollapsibleCardList,
  Pagination
} from '@/components/common';
import {
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead
} from '@/components/common/table';
import { StatusBadge } from '@/components/features/events/status-badge';
import { WithdrawalHistoryItem } from '@/services/withdrawal';
import { dateUtils } from '@/utils/dateUtils';
import { formatUtils } from '@/utils/formatUtils';

import WithdrawalDetailModal from '../modal/detail';

interface WithdrawalHistoryTableProps {
  withdrawals: WithdrawalHistoryItem[];
  loading?: boolean;
  hideEOName?: boolean;
  hideEventName?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const WithdrawalHistoryTable: FC<WithdrawalHistoryTableProps> = ({
  withdrawals,
  loading = false,
  hideEOName = false,
  hideEventName = false,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  onPageChange
}) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalHistoryItem | null>(null);

  const handleViewWithdrawal = (withdrawal: WithdrawalHistoryItem) => {
    setSelectedWithdrawal(withdrawal);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedWithdrawal(null);
  };

  const renderActionCell = (withdrawal: WithdrawalHistoryItem) => (
    <IconButton
      size="small"
      onClick={() => handleViewWithdrawal(withdrawal)}
      sx={{
        color: 'primary.main'
      }}
    >
      <VisibilityIcon fontSize="small" />
    </IconButton>
  );

  const colSpan = 8 - (hideEOName ? 1 : 0) - (hideEventName ? 1 : 0);

  const pagination = (
    <Pagination
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => onPageChange && onPageChange(page)}
      loading={loading}
    />
  );

  const modal = (
    <WithdrawalDetailModal
      open={modalOpen}
      onClose={handleCloseModal}
      withdrawal={selectedWithdrawal}
    />
  );

  const sectionHeader = (
    <Box borderBottom={`1px solid ${theme.palette.grey[100]}`} pb={2}>
      <Body1 color="text.primary" fontWeight={600}>
        Withdrawal History
      </Body1>
    </Box>
  );

  return (
    <>
      <StyledTableContainer sx={{ display: { xs: 'block', lg: 'none' } }}>
        {sectionHeader}
        <CollapsibleCardList
          items={withdrawals}
          getKey={(withdrawal) => withdrawal.id}
          loading={loading}
          loadingMessage="Loading withdrawal history..."
          emptyMessage="No withdrawal history found"
          renderTitle={(withdrawal, index) =>
            `${index + 1 + currentPage * pageSize}. ${withdrawal.withdrawalId}`
          }
          renderDetails={(withdrawal) => {
            const details: { label: string; value: ReactNode }[] = [];

            if (!hideEOName) {
              details.push({
                label: 'Event Organizer',
                value: withdrawal.eventOrganizerName
              });
            }
            if (!hideEventName) {
              details.push({
                label: 'Event Name',
                value: withdrawal.eventName
              });
            }
            details.push(
              {
                label: 'Withdrawal Name',
                value: withdrawal.withdrawalName || '-'
              },
              {
                label: 'Submission Date',
                value: dateUtils.formatDateDDMMYYYY(withdrawal.createdAt)
              },
              {
                label: 'Amount Received',
                value: (
                  <Body2 fontSize="12px" color="primary.main">
                    {formatUtils.formatPrice(
                      parseFloat(withdrawal.amountReceived)
                    )}
                  </Body2>
                )
              },
              {
                label: 'Withdrawal Status',
                value: (
                  <StatusBadge
                    status={withdrawal.status}
                    displayName={
                      withdrawal.status === 'APPROVED' ? 'Approved' : ''
                    }
                  />
                )
              }
            );
            return details;
          }}
          renderActions={renderActionCell}
        />
        {pagination}
      </StyledTableContainer>

      <StyledTableContainer sx={{ display: { xs: 'none', lg: 'block' } }}>
        {sectionHeader}
        <Table>
          <StyledTableHead>
            <TableRow>
              <TableCell sx={{ width: '5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  No.
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Request ID
                </Body2>
              </TableCell>
              {!hideEOName && (
                <TableCell sx={{ width: '20%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Event Organizer
                  </Body2>
                </TableCell>
              )}
              {!hideEventName && (
                <TableCell sx={{ width: '20%' }}>
                  <Body2 color="text.secondary" fontSize="14px">
                    Event Name
                  </Body2>
                </TableCell>
              )}
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Withdrawal Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Submission Date
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Amount Received
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Withdrawal Status
                </Body2>
              </TableCell>
              <TableCell align="right" sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={colSpan} sx={{ border: 'none' }}>
                  <Box display="flex" justifyContent="center" padding="40px">
                    <Body2 color="text.secondary">
                      Loading withdrawal history...
                    </Body2>
                  </Box>
                </TableCell>
              </TableRow>
            ) : withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ padding: '40px' }}>
                  <Body2 color="text.secondary">
                    No withdrawal history found
                  </Body2>
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal, index) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <Body2 fontSize="14px">
                      {index + 1 + currentPage * pageSize}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 fontSize="14px">{withdrawal.withdrawalId}</Body2>
                  </TableCell>
                  {!hideEOName && (
                    <TableCell>
                      <Body2 fontSize="14px">
                        {withdrawal.eventOrganizerName}
                      </Body2>
                    </TableCell>
                  )}
                  {!hideEventName && (
                    <TableCell>
                      <Body2 fontSize="14px">{withdrawal.eventName}</Body2>
                    </TableCell>
                  )}
                  <TableCell>
                    <Body2 fontSize="14px">
                      {withdrawal.withdrawalName || '-'}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <Caption fontSize="14px">
                      {dateUtils.formatDateDDMMYYYY(withdrawal.createdAt)}
                    </Caption>
                  </TableCell>
                  <TableCell>
                    <Body2 fontSize="14px" color="primary.main">
                      {formatUtils.formatPrice(
                        parseFloat(withdrawal.amountReceived)
                      )}
                    </Body2>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={withdrawal.status}
                      displayName={
                        withdrawal.status === 'APPROVED' ? 'Approved' : ''
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    {renderActionCell(withdrawal)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </StyledTableBody>
        </Table>

        {pagination}
      </StyledTableContainer>

      {modal}
    </>
  );
};

export default WithdrawalHistoryTable;
