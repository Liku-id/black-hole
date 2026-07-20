import {
  IconButton,
  Table,
  TableCell,
  TableRow
} from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import {
  Body2,
  CollapsibleCardList,
  Pagination
} from '@/components/common';
import {
  StyledTableContainer,
  StyledTableHead,
  StyledTableBody
} from '@/components/common/table';
import WithdrawalApprovalModal from '@/components/features/approval/withdrawal/modal';
import WithdrawalDetailModal from '@/components/features/approval/withdrawal/modal/detail';
import { StatusBadge } from '@/components/features/events/status-badge';
import { useToast } from '@/contexts/ToastContext';
import { WithdrawalListItem, withdrawalService } from '@/services/withdrawal';
import { truncate } from '@/utils';
import { formatUtils } from '@/utils/formatUtils';

interface WithdrawalTableProps {
  withdrawals: WithdrawalListItem[];
  loading?: boolean;
  onRefresh?: () => void;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const WithdrawalTable = ({
  withdrawals,
  loading,
  onRefresh,
  total = 0,
  currentPage = 0,
  pageSize = 10,
  onPageChange
}: WithdrawalTableProps) => {
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalListItem | null>(null);
  const [modalError, setModalError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { showInfo } = useToast();

  const handleViewClick = (withdrawal: WithdrawalListItem) => {
    setSelectedWithdrawal(withdrawal);
    if (withdrawal.status === 'PENDING') {
      setApprovalModalOpen(true);
    } else {
      setDetailModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setApprovalModalOpen(false);
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
      const response = await withdrawalService.actionWithdrawal(
        selectedWithdrawal.id,
        {
          id: selectedWithdrawal.id,
          action: data.action,
          rejectionReason: data.rejectionReason
        }
      );

      if (response.statusCode && response.statusCode !== 200) {
        throw new Error(
          response.message || 'Failed to process withdrawal action'
        );
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

  const renderViewAction = (withdrawal: WithdrawalListItem) => (
    <IconButton
      size="small"
      sx={{ color: 'text.secondary', cursor: 'pointer' }}
      onClick={() => handleViewClick(withdrawal)}
    >
      <Image alt="View" height={24} src="/icon/eye.svg" width={24} />
    </IconButton>
  );

  const pagination = (
    <Pagination
      total={total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(page) => onPageChange && onPageChange(page)}
      loading={loading}
    />
  );

  const modals = (
    <>
      <WithdrawalApprovalModal
        open={approvalModalOpen}
        onClose={handleModalClose}
        onAction={handleAction}
        errorMessage={modalError}
        loading={actionLoading}
      />
      <WithdrawalDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        withdrawal={selectedWithdrawal}
      />
    </>
  );

  return (
    <>
      <StyledTableContainer sx={{ display: { xs: 'block', lg: 'none' } }}>
        <CollapsibleCardList
          items={withdrawals}
          getKey={(item) => item.id}
          loading={loading}
          loadingMessage="Loading withdrawals..."
          emptyMessage="No withdrawals found"
          renderTitle={(item, index) =>
            `${index + 1 + currentPage * pageSize}. ${truncate(item.eventName, 20) || '-'}`
          }
          renderDetails={(item) => [
            {
              label: 'Withdrawal',
              value: item.withdrawalName || '-'
            },
            {
              label: 'Received',
              value: formatUtils.formatPrice(parseFloat(item.amountReceived))
            },
            {
              label: 'Status',
              value: (
                <StatusBadge
                  status={item.status}
                  displayName={
                    item.status === 'APPROVED' ? 'Approved' : ''
                  }
                />
              )
            },
            {
              label: 'Bank Name',
              value: truncate(item.bankName, 10) || '-'
            },
            {
              label: 'Account Number',
              value: item.accountNumber
            },
            {
              label: 'Account Holder',
              value: truncate(item.accountHolderName, 15) || '-'
            }
          ]}
          renderActions={renderViewAction}
        />
        {pagination}
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
              <TableCell sx={{ width: '15%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Event Name
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '12.5%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Withdrawal
                </Body2>
              </TableCell>
              <TableCell sx={{ width: '10%' }}>
                <Body2 color="text.secondary" fontSize="14px">
                  Received
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
                    {index + 1 + currentPage * pageSize}.
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {truncate(withdrawal.eventName, 20) || '-'}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {withdrawal.withdrawalName || '-'}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
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
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {truncate(withdrawal.bankName, 10) || '-'}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {withdrawal.accountNumber}
                  </Body2>
                </TableCell>
                <TableCell>
                  <Body2 color="text.primary" fontSize="14px">
                    {truncate(withdrawal.accountHolderName, 15) || '-'}
                  </Body2>
                </TableCell>
                <TableCell>{renderViewAction(withdrawal)}</TableCell>
              </TableRow>
            ))}
          </StyledTableBody>
        </Table>
        {pagination}
      </StyledTableContainer>
      {modals}
    </>
  );
};

export default WithdrawalTable;
