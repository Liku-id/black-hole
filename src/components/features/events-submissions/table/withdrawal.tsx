import { Box, IconButton, Table, TableCell, TableRow } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { Body2 } from '@/components/common';
import { useToast } from '@/contexts/ToastContext';
import { StyledTableContainer, StyledTableHead, StyledTableBody } from '@/components/common/table';
import { StatusBadge } from '@/components/features/events/status-badge';
import WithdrawalActionModal from '@/components/features/events-submissions/modal/withdrawal';
import { WithdrawalListItem, withdrawalService } from '@/services/withdrawal';
import { formatUtils } from '@/utils/formatUtils';

interface WithdrawalTableProps {
  withdrawals: WithdrawalListItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

const WithdrawalTable = ({ withdrawals, loading, onRefresh }: WithdrawalTableProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalListItem | null>(null);
  const [modalError, setModalError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { showInfo } = useToast();

  const handleViewClick = (withdrawal: WithdrawalListItem) => {
    setSelectedWithdrawal(withdrawal);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedWithdrawal(null);
    setModalError('');
  };

  const handleAction = async (data: {
    action: 'approve' | 'reject';
    rejectionReason?: string;
  }) => {
    setModalError('');
    setActionLoading(true);
    
    try {
      const response = await withdrawalService.actionWithdrawal(selectedWithdrawal.id, {
        action: data.action,
        rejectionReason: data.rejectionReason
      });

      // Check if response indicates error
      if (response.statusCode && response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to process withdrawal action');
      } else {
        const actionText = data.action === 'approve' ? 'approved' : 'rejected';
        showInfo(`Withdrawal successfully ${actionText}`);
        handleModalClose();
        onRefresh();
      }

    } catch (error: any) {
      let errorMsg = 'Failed to process withdrawal action. Please try again.';
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      setModalError(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding={4}>
        <Body2>Loading withdrawals...</Body2>
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
                  No.
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12.5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Amount
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Total Fee
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '7.5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Status
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Bank Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12.5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Account Number
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Account Holder
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Action
                </Body2>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          <StyledTableBody>
            {withdrawals.map((withdrawal, index) => (
              <TableRow key={withdrawal.id}>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {index + 1}.
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    -
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {formatUtils.formatPrice(parseFloat(withdrawal.requestedAmount))}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {formatUtils.formatPrice(withdrawal.totalFee)}
                  </Body2>
                </TableCell>
                <TableCell>
                  <StatusBadge status={withdrawal.status} />
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    -
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {withdrawal.accountNumber}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {withdrawal.accountHolderName}
                  </Body2>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    sx={{ color: 'text.secondary', cursor: 'pointer' }}
                    onClick={() => handleViewClick(withdrawal)}
                  >
                    <Image
                      alt="View"
                      height={24}
                      src="/icon/eye.svg"
                      width={24}
                    />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </StyledTableBody>
        </Table>
      </StyledTableContainer>

      <WithdrawalActionModal
        open={modalOpen}
        onClose={handleModalClose}
        onAction={handleAction}
        errorMessage={modalError}
        loading={actionLoading}
      />
    </>
  );
};

export default WithdrawalTable;
