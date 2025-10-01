import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  IconButton,
  Table,
  TableCell,
  TableRow
} from '@mui/material';
import { FC, useState } from 'react';

import { Body1, Body2, Caption } from '@/components/common';
import {
  StyledTableBody,
  StyledTableContainer,
  StyledTableHead
} from '@/components/common/table';
import { StatusBadge } from '@/components/features/events/status-badge';
import { dateUtils } from '@/utils/dateUtils';
import { formatUtils } from '@/utils/formatUtils';
import { WithdrawalHistoryItem } from '@/services/withdrawal';
import WithdrawalDetailModal from '../modal/detail';

interface WithdrawalHistoryTableProps {
  withdrawals: WithdrawalHistoryItem[];
  loading?: boolean;
  onView?: (withdrawal: WithdrawalHistoryItem) => void;
  hideEventName?: boolean;
}



const WithdrawalHistoryTable: FC<WithdrawalHistoryTableProps> = ({
  withdrawals,
  loading = false,
  hideEventName = false
}) => {
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
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="40px">
        <Body2 color="text.secondary">Loading withdrawal history...</Body2>
      </Box>
    );
  }

  return (
    <>
      <StyledTableContainer>
        <Box mb={2} pb={2} borderBottom="1px solid #E2E8F0">
          <Body1 color="text.primary" fontWeight={600}>
            Withdrawal History
          </Body1>
        </Box>
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
            {withdrawals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hideEventName ? 7 : 8}
                  align="center"
                  sx={{ padding: '40px' }}
                >
                  <Body2 color="text.secondary">
                    No withdrawal history found
                  </Body2>
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal, index) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <Body2 fontSize="14px">{index + 1}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 fontSize="14px">{withdrawal.withdrawalId}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 fontSize="14px">{withdrawal.eventName}</Body2>
                  </TableCell>
                  <TableCell>
                    <Body2 fontSize="14px">
                      {withdrawal.withdrawalName || "-"}
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
                    <StatusBadge status={withdrawal.status} displayName={withdrawal.status === "APPROVED" ? "Approved" : ""}/>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewWithdrawal(withdrawal)}
                      sx={{
                        color: 'primary.main'
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>

      <WithdrawalDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        withdrawal={selectedWithdrawal}
      />
    </>
  );
};

export default WithdrawalHistoryTable;
