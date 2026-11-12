import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useToast } from '@/contexts/ToastContext';
import { withdrawalService, WithdrawalListItem } from '@/services/withdrawal';

import WithdrawalTable from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('@/services/withdrawal', () => ({
  withdrawalService: {
    actionWithdrawal: jest.fn()
  }
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/components/common', () => {
  const {
    CollapsibleCardListMock
  } = require('@/test-utils/collapsible-card-list-mock');
  return {
    Body2: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    CollapsibleCardList: CollapsibleCardListMock,
    Pagination: ({
      currentPage,
      loading,
      onPageChange,
      total
    }: {
      currentPage: number;
      loading?: boolean;
      onPageChange: (page: number) => void;
      total: number;
    }) => (
      <div
        data-loading={String(Boolean(loading))}
        data-testid="pagination"
        data-total={total}
      >
        <span>Showing page {currentPage}</span>
        <button type="button" onClick={() => onPageChange(currentPage + 1)}>
          Next Page
        </button>
      </div>
    )
  };
});

jest.mock('@/components/common/table', () => ({
  StyledTableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  StyledTableContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  StyledTableHead: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  )
}));

jest.mock('@/components/features/events/status-badge', () => ({
  StatusBadge: ({
    displayName,
    status
  }: {
    displayName?: string;
    status: string;
  }) => <span data-testid="status-badge">{displayName || status}</span>
}));

jest.mock('@/components/features/approval/withdrawal/modal', () => ({
  __esModule: true,
  default: ({
    errorMessage,
    loading,
    onAction,
    onClose,
    open
  }: {
    errorMessage?: string;
    loading?: boolean;
    onAction: (data: {
      action: 'approve' | 'reject';
      rejectionReason?: string;
    }) => void;
    onClose: () => void;
    open: boolean;
  }) =>
    open ? (
      <div data-testid="withdrawal-approval-modal">
        {errorMessage && (
          <div data-testid="approval-modal-error">{errorMessage}</div>
        )}
        <div data-testid="approval-modal-loading">
          {String(Boolean(loading))}
        </div>
        <button type="button" onClick={() => onAction({ action: 'approve' })}>
          Approve Action
        </button>
        <button
          type="button"
          onClick={() =>
            onAction({ action: 'reject', rejectionReason: 'Invalid bank' })
          }
        >
          Reject Action
        </button>
        <button type="button" onClick={onClose}>
          Close Approval Modal
        </button>
      </div>
    ) : null
}));

jest.mock('@/components/features/approval/withdrawal/modal/detail', () => ({
  __esModule: true,
  default: ({
    onClose,
    open,
    withdrawal
  }: {
    onClose: () => void;
    open: boolean;
    withdrawal: WithdrawalListItem | null;
  }) =>
    open ? (
      <div data-testid="withdrawal-detail-modal">
        <span>{withdrawal?.eventName || 'Detail'}</span>
        <button type="button" onClick={onClose}>
          Close Detail Modal
        </button>
      </div>
    ) : null
}));

const mockShowInfo = jest.fn();
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('WithdrawalTable', () => {
  const mockOnRefresh = jest.fn();
  const mockOnPageChange = jest.fn();

  const mockWithdrawals: WithdrawalListItem[] = [
    {
      id: '1',
      withdrawalId: 'WD-001',
      withdrawalName: 'Withdrawal 1',
      eventId: 'evt-1',
      eventName: 'Test Event',
      eventOrganizerId: 'org-1',
      createdBy: 'user-1',
      requestedAmount: '1000000',
      totalFee: 50000,
      amountReceived: '950000',
      status: 'PENDING',
      approvedBy: '',
      approvedAt: '',
      rejectedBy: '',
      rejectedAt: '',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      deletedAt: '',
      feeSnapshot: [],
      withdrawalFee: 50000,
      bankId: 'bank-1',
      accountNumber: '1234567890',
      accountHolderName: 'John Doe',
      bankName: 'Bank BCA'
    } as any,
    {
      id: '2',
      withdrawalId: 'WD-002',
      withdrawalName: 'Withdrawal 2',
      eventId: 'evt-2',
      eventName: 'Test Event 2',
      eventOrganizerId: 'org-2',
      createdBy: 'user-2',
      requestedAmount: '2000000',
      totalFee: 100000,
      amountReceived: '1900000',
      status: 'APPROVED',
      approvedBy: 'admin-1',
      approvedAt: '2024-01-02',
      rejectedBy: '',
      rejectedAt: '',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
      deletedAt: '',
      feeSnapshot: [],
      withdrawalFee: 100000,
      bankId: 'bank-2',
      accountNumber: '0987654321',
      accountHolderName: 'Jane Doe',
      bankName: 'Bank Mandiri'
    } as any
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({
      showInfo: mockShowInfo,
      showError: jest.fn(),
      showSuccess: jest.fn(),
      showWarning: jest.fn()
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Table Rendering', () => {
    it('should render table headers and withdrawal data including fallback "-" values', () => {
      const incompleteWithdrawal: WithdrawalListItem = {
        ...mockWithdrawals[0],
        id: '3',
        eventName: '',
        withdrawalName: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: ''
      };

      render(
        <WithdrawalTable
          loading={false}
          withdrawals={[...mockWithdrawals, incompleteWithdrawal]}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('No.')).toBeInTheDocument();
      expect(screen.getByText('Event Name')).toBeInTheDocument();
      expect(screen.getByText('Withdrawal')).toBeInTheDocument();
      expect(screen.getByText('Received')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Bank Name')).toBeInTheDocument();
      expect(screen.getByText('Account Number')).toBeInTheDocument();
      expect(screen.getByText('Account Holder')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();

      expect(screen.getAllByText('Test Event').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Test Event 2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });

    it('should pass loading and empty props cleanly', () => {
      const { rerender } = render(
        <WithdrawalTable loading={true} withdrawals={[]} />
      );

      expect(screen.getByText('Loading withdrawals...')).toBeInTheDocument();

      rerender(<WithdrawalTable loading={false} withdrawals={[]} />);

      expect(screen.getByText('No withdrawals found')).toBeInTheDocument();
    });
  });

  describe('Modal and Action Flows', () => {
    it('should open and close approval modal for PENDING withdrawal', () => {
      render(
        <WithdrawalTable
          loading={false}
          withdrawals={[mockWithdrawals[0]]}
          onRefresh={mockOnRefresh}
        />
      );

      const viewButton = screen.getAllByAltText('View')[0].closest('button')!;
      fireEvent.click(viewButton);

      expect(
        screen.getByTestId('withdrawal-approval-modal')
      ).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close Approval Modal'));
      expect(
        screen.queryByTestId('withdrawal-approval-modal')
      ).not.toBeInTheDocument();
    });

    it('should approve and reject withdrawal successfully and trigger onRefresh', async () => {
      (withdrawalService.actionWithdrawal as jest.Mock).mockResolvedValue({
        statusCode: 200,
        message: 'ok'
      });

      render(
        <WithdrawalTable
          loading={false}
          withdrawals={[mockWithdrawals[0]]}
          onRefresh={mockOnRefresh}
        />
      );

      // Approve flow
      fireEvent.click(screen.getAllByAltText('View')[0].closest('button')!);
      fireEvent.click(screen.getByText('Approve Action'));

      await waitFor(() => {
        expect(withdrawalService.actionWithdrawal).toHaveBeenCalledWith('1', {
          id: '1',
          action: 'approve',
          rejectionReason: undefined
        });
      });
      expect(mockShowInfo).toHaveBeenCalledWith(
        'Withdrawal successfully approved'
      );
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByTestId('withdrawal-approval-modal')
      ).not.toBeInTheDocument();

      // Reject flow with statusCode 200
      fireEvent.click(screen.getAllByAltText('View')[0].closest('button')!);
      fireEvent.click(screen.getByText('Reject Action'));

      await waitFor(() => {
        expect(withdrawalService.actionWithdrawal).toHaveBeenCalledWith('1', {
          id: '1',
          action: 'reject',
          rejectionReason: 'Invalid bank'
        });
      });
      expect(mockShowInfo).toHaveBeenCalledWith(
        'Withdrawal successfully rejected'
      );
      expect(mockOnRefresh).toHaveBeenCalledTimes(2);
    });

    it('should display appropriate error messages for non-200 status and rejected promises', async () => {
      (withdrawalService.actionWithdrawal as jest.Mock)
        .mockResolvedValueOnce({
          statusCode: 400,
          message: 'Bad withdrawal request'
        })
        .mockResolvedValueOnce({
          statusCode: 500,
          message: ''
        })
        .mockRejectedValueOnce({
          response: { data: { message: 'Server validation error' } }
        })
        .mockRejectedValueOnce(new Error('Network down'))
        .mockRejectedValueOnce({});

      render(
        <WithdrawalTable
          loading={false}
          withdrawals={[mockWithdrawals[0]]}
          onRefresh={mockOnRefresh}
        />
      );

      fireEvent.click(screen.getAllByAltText('View')[0].closest('button')!);

      // 1st: statusCode 400 with message
      fireEvent.click(screen.getByText('Approve Action'));
      await waitFor(() => {
        expect(screen.getByTestId('approval-modal-error')).toHaveTextContent(
          'Bad withdrawal request'
        );
      });

      // 2nd: statusCode 500 without message
      fireEvent.click(screen.getByText('Approve Action'));
      await waitFor(() => {
        expect(screen.getByTestId('approval-modal-error')).toHaveTextContent(
          'Failed to process withdrawal action'
        );
      });

      // 3rd: axios-style error.response.data.message
      fireEvent.click(screen.getByText('Approve Action'));
      await waitFor(() => {
        expect(screen.getByTestId('approval-modal-error')).toHaveTextContent(
          'Server validation error'
        );
      });

      // 4th: standard Error instance
      fireEvent.click(screen.getByText('Approve Action'));
      await waitFor(() => {
        expect(screen.getByTestId('approval-modal-error')).toHaveTextContent(
          'Network down'
        );
      });

      // 5th: unknown error fallback
      fireEvent.click(screen.getByText('Approve Action'));
      await waitFor(() => {
        expect(screen.getByTestId('approval-modal-error')).toHaveTextContent(
          'Failed to process withdrawal action. Please try again.'
        );
      });
    });

    it('should open and close detail modal for non-PENDING withdrawal', () => {
      render(
        <WithdrawalTable
          loading={false}
          withdrawals={[mockWithdrawals[1]]}
          onRefresh={mockOnRefresh}
        />
      );

      const viewButton = screen.getAllByAltText('View')[0].closest('button')!;
      fireEvent.click(viewButton);

      expect(screen.getByTestId('withdrawal-detail-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close Detail Modal'));
      expect(
        screen.queryByTestId('withdrawal-detail-modal')
      ).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should call onPageChange when provided and handle undefined onPageChange safely', () => {
      const { rerender } = render(
        <WithdrawalTable
          currentPage={0}
          loading={false}
          pageSize={10}
          total={20}
          withdrawals={mockWithdrawals}
          onPageChange={mockOnPageChange}
        />
      );

      fireEvent.click(screen.getAllByText('Next Page')[0]);
      expect(mockOnPageChange).toHaveBeenCalledWith(1);

      rerender(
        <WithdrawalTable
          currentPage={0}
          loading={false}
          pageSize={10}
          total={20}
          withdrawals={mockWithdrawals}
        />
      );

      expect(() =>
        fireEvent.click(screen.getAllByText('Next Page')[0])
      ).not.toThrow();
    });
  });
});
