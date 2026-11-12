import { fireEvent, render, screen } from '@testing-library/react';

import { WithdrawalHistoryItem } from '@/services/withdrawal';

import WithdrawalHistoryTable from './index';

jest.mock('@/components/common', () => {
  const {
    CollapsibleCardListMock
  } = require('@/test-utils/collapsible-card-list-mock');
  return {
    Body1: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Body2: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Caption: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    CollapsibleCardList: CollapsibleCardListMock,
    Pagination: ({
      currentPage,
      loading,
      onPageChange,
      pageSize,
      total
    }: {
      currentPage: number;
      loading?: boolean;
      onPageChange: (page: number) => void;
      pageSize: number;
      total: number;
    }) =>
      loading ? null : (
        <div
          data-current-page={currentPage}
          data-page-size={pageSize}
          data-testid="pagination"
          data-total={total}
        >
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

jest.mock('../modal/detail', () => ({
  __esModule: true,
  default: ({
    onClose,
    open,
    withdrawal
  }: {
    onClose: () => void;
    open: boolean;
    withdrawal: WithdrawalHistoryItem | null;
  }) =>
    open ? (
      <div data-testid="detail-modal">
        <span>{withdrawal?.withdrawalId}</span>
        <button type="button" onClick={onClose}>
          Close Modal
        </button>
      </div>
    ) : null
}));

describe('WithdrawalHistoryTable', () => {
  const mockWithdrawals: WithdrawalHistoryItem[] = [
    {
      id: 'w-1',
      withdrawalId: 'WD-101',
      withdrawalName: 'Vendor Payout',
      eventId: 'evt-1',
      eventName: 'Rock Concert',
      eventOrganizerId: 'eo-1',
      eventOrganizerName: 'Rock EO',
      createdBy: 'user-1',
      requestedAmount: '1000000',
      totalFee: 10000,
      withdrawalFee: '5000',
      amountReceived: '985000',
      status: 'APPROVED',
      approvedBy: 'admin-1',
      approvedAt: '2024-06-02T00:00:00Z',
      rejectedBy: '',
      rejectedAt: '',
      createdAt: '2024-06-01T10:00:00Z',
      updatedAt: '2024-06-02T00:00:00Z',
      deletedAt: '',
      feeSnapshot: [],
      bankId: 'bank-1',
      bankName: 'BCA',
      accountNumber: '111222333',
      accountHolderName: 'Rock EO PT'
    },
    {
      id: 'w-2',
      withdrawalId: 'WD-102',
      withdrawalName: '',
      eventId: 'evt-2',
      eventName: 'Jazz Night',
      eventOrganizerId: 'eo-2',
      eventOrganizerName: 'Jazz EO',
      createdBy: 'user-2',
      requestedAmount: '500000',
      totalFee: 5000,
      withdrawalFee: '2500',
      amountReceived: '492500',
      status: 'PENDING',
      approvedBy: '',
      approvedAt: '',
      rejectedBy: '',
      rejectedAt: '',
      createdAt: '2024-06-03T10:00:00Z',
      updatedAt: '2024-06-03T10:00:00Z',
      deletedAt: '',
      feeSnapshot: [],
      bankId: 'bank-2',
      bankName: 'Mandiri',
      accountNumber: '444555666',
      accountHolderName: 'Jazz EO PT'
    }
  ];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading state', () => {
    render(<WithdrawalHistoryTable loading={true} withdrawals={[]} />);

    expect(
      screen.getAllByText('Loading withdrawal history...').length
    ).toBeGreaterThanOrEqual(2);
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<WithdrawalHistoryTable loading={false} withdrawals={[]} />);

    expect(
      screen.getAllByText('No withdrawal history found').length
    ).toBeGreaterThanOrEqual(2);
  });

  it('renders all columns and rows including APPROVED and fallback withdrawalName', () => {
    render(
      <WithdrawalHistoryTable
        currentPage={1}
        pageSize={5}
        total={20}
        withdrawals={mockWithdrawals}
      />
    );

    expect(screen.getByText('Event Organizer')).toBeInTheDocument();
    expect(screen.getByText('Event Name')).toBeInTheDocument();
    expect(screen.getAllByText('Rock EO').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rock Concert').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Vendor Payout').length).toBeGreaterThan(0);
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Approved').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0);
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('hides Event Organizer and Event Name columns when hideEOName and hideEventName are true', () => {
    render(
      <WithdrawalHistoryTable
        hideEOName={true}
        hideEventName={true}
        withdrawals={mockWithdrawals}
      />
    );

    expect(screen.queryByText('Event Organizer')).not.toBeInTheDocument();
    expect(screen.queryByText('Event Name')).not.toBeInTheDocument();
    expect(screen.queryByText('Rock EO')).not.toBeInTheDocument();
    expect(screen.queryByText('Rock Concert')).not.toBeInTheDocument();
  });

  it('opens and closes WithdrawalDetailModal when action button is clicked', () => {
    render(<WithdrawalHistoryTable withdrawals={mockWithdrawals} />);

    expect(screen.queryByTestId('detail-modal')).not.toBeInTheDocument();

    const actionButtons = screen.getAllByTestId('VisibilityIcon');
    fireEvent.click(actionButtons[0].closest('button')!);

    expect(screen.getByTestId('detail-modal')).toBeInTheDocument();
    expect(screen.getAllByText('WD-101').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('Close Modal'));
    expect(screen.queryByTestId('detail-modal')).not.toBeInTheDocument();
  });

  it('handles pagination with and without onPageChange callback', () => {
    const onPageChange = jest.fn();
    const { rerender } = render(
      <WithdrawalHistoryTable
        currentPage={0}
        pageSize={10}
        total={25}
        withdrawals={mockWithdrawals}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getAllByText('Next Page')[0]);
    expect(onPageChange).toHaveBeenCalledWith(1);

    rerender(
      <WithdrawalHistoryTable
        currentPage={0}
        pageSize={10}
        total={25}
        withdrawals={mockWithdrawals}
      />
    );

    expect(() =>
      fireEvent.click(screen.getAllByText('Next Page')[0])
    ).not.toThrow();
  });
});
