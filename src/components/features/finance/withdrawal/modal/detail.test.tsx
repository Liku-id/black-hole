import { fireEvent, render, screen } from '@testing-library/react';

import { WithdrawalHistoryItem } from '@/services/withdrawal';

import WithdrawalDetailModal from './detail';

jest.mock('@/components/common', () => ({
  Body2: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Modal: ({
    children,
    onClose,
    open,
    title
  }: {
    children: React.ReactNode;
    onClose?: () => void;
    open: boolean;
    title: string;
  }) =>
    open ? (
      <div data-testid="withdrawal-detail-modal">
        <h2>{title}</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
        <div>{children}</div>
      </div>
    ) : null
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

describe('WithdrawalDetailModal (finance)', () => {
  const baseWithdrawal: WithdrawalHistoryItem = {
    id: 'wd-1',
    withdrawalId: 'WD-001',
    withdrawalName: 'Stage Vendor Payment',
    eventId: 'evt-1',
    eventName: 'Annual Music Festival Concert With Long Name',
    eventOrganizerId: 'eo-1',
    eventOrganizerName: 'Great EO',
    createdBy: 'user-1',
    requestedAmount: '1000000',
    totalFee: 25000,
    withdrawalFee: '5000',
    amountReceived: '970000',
    status: 'APPROVED',
    approvedBy: 'admin-1',
    approvedAt: '2024-05-02T10:00:00Z',
    rejectedBy: '',
    rejectedAt: '',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-02T10:00:00Z',
    deletedAt: '',
    feeSnapshot: [],
    bankId: 'bank-1',
    bankName: 'Bank BCA',
    accountNumber: '1234567890',
    accountHolderName: 'Johnathan Alexander Doe Long Name'
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns null when withdrawal is null', () => {
    const { container } = render(
      <WithdrawalDetailModal
        open={true}
        withdrawal={null}
        onClose={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render modal content when open is false', () => {
    render(
      <WithdrawalDetailModal
        open={false}
        withdrawal={baseWithdrawal}
        onClose={jest.fn()}
      />
    );

    expect(
      screen.queryByTestId('withdrawal-detail-modal')
    ).not.toBeInTheDocument();
  });

  it('renders full withdrawal details including APPROVED status', () => {
    render(
      <WithdrawalDetailModal
        open={true}
        withdrawal={baseWithdrawal}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Withdrawal Detail')).toBeInTheDocument();
    expect(screen.getByText('WD-001')).toBeInTheDocument();
    expect(screen.getByText('Stage Vendor Payment')).toBeInTheDocument();
    expect(
      screen.getByText('Annual Music Festival Con...')
    ).toBeInTheDocument();
    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText(/30\.000/)).toBeInTheDocument();
    expect(screen.getByText(/970\.000/)).toBeInTheDocument();
    expect(screen.getByText('Bank BCA')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(
      screen.getByText('Johnathan Alexander Doe L...')
    ).toBeInTheDocument();
    expect(screen.getByText('01/05/2024')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Approved');
  });

  it('renders fallback values and non-APPROVED status cleanly', () => {
    const incompleteWithdrawal: WithdrawalHistoryItem = {
      ...baseWithdrawal,
      withdrawalId: '',
      withdrawalName: '',
      eventName: '',
      totalFee: 0,
      withdrawalFee: '',
      amountReceived: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      createdAt: '',
      status: ''
    };

    render(
      <WithdrawalDetailModal
        open={true}
        withdrawal={incompleteWithdrawal}
        onClose={jest.fn()}
      />
    );

    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(7);
    expect(screen.getAllByText(/Rp\s*0/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('UNKNOWN');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();

    render(
      <WithdrawalDetailModal
        open={true}
        withdrawal={{ ...baseWithdrawal, status: 'PENDING' }}
        onClose={onClose}
      />
    );

    expect(screen.getByTestId('status-badge')).toHaveTextContent('PENDING');
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
