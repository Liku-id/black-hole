import { render, screen } from '@testing-library/react';

import { WithdrawalListItem } from '@/services/withdrawal';

import WithdrawalDetailModal from './index';

describe('WithdrawalDetailModal', () => {
  const mockOnClose = jest.fn();

  const mockWithdrawal: WithdrawalListItem = {
    id: '1',
    withdrawalId: 'WD-001',
    withdrawalName: 'Test Withdrawal',
    eventId: 'event1',
    eventName: 'Test Event Name',
    eventOrganizerId: 'org1',
    createdBy: 'user1',
    requestedAmount: '1000000',
    totalFee: 50000,
    amountReceived: '950000',
    status: 'APPROVED',
    approvedBy: 'admin1',
    approvedAt: '2024-01-15',
    rejectedBy: '',
    rejectedAt: '',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    deletedAt: '',
    feeSnapshot: [],
    bankId: 'bank1',
    accountNumber: '1234567890',
    accountHolderName: 'John Doe',
    bankName: 'Bank BCA'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true and withdrawal is provided', () => {
      render(
        <WithdrawalDetailModal
          open={true}
          onClose={mockOnClose}
          withdrawal={mockWithdrawal}
        />
      );

      expect(screen.getByText('Withdrawal Detail')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <WithdrawalDetailModal
          open={false}
          onClose={mockOnClose}
          withdrawal={mockWithdrawal}
        />
      );

      expect(screen.queryByText('Withdrawal Detail')).not.toBeInTheDocument();
    });

    it('should return null when withdrawal is null', () => {
      const { container } = render(
        <WithdrawalDetailModal
          open={true}
          onClose={mockOnClose}
          withdrawal={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Withdrawal Information Display', () => {
    it('should display all withdrawal details', () => {
      render(
        <WithdrawalDetailModal
          open={true}
          onClose={mockOnClose}
          withdrawal={mockWithdrawal}
        />
      );

      expect(screen.getByText('Withdrawal ID')).toBeInTheDocument();
      expect(screen.getByText('WD-001')).toBeInTheDocument();
      expect(screen.getByText('Withdrawal Name')).toBeInTheDocument();
      expect(screen.getByText('Test Withdrawal')).toBeInTheDocument();
      expect(screen.getByText('Event Name')).toBeInTheDocument();
      expect(screen.getByText('Bank Name')).toBeInTheDocument();
      expect(screen.getByText('Bank BCA')).toBeInTheDocument();
      expect(screen.getByText('Account Number')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('Account Holder Name')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should display status badge', () => {
      render(
        <WithdrawalDetailModal
          open={true}
          onClose={mockOnClose}
          withdrawal={mockWithdrawal}
        />
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Approved Withdrawal', () => {
    it('should display approved information when status is APPROVED', () => {
      render(
        <WithdrawalDetailModal
          open={true}
          onClose={mockOnClose}
          withdrawal={mockWithdrawal}
        />
      );

      expect(screen.getByText('Approved By')).toBeInTheDocument();
      expect(screen.getByText('admin1')).toBeInTheDocument();
      expect(screen.getByText('Approved At')).toBeInTheDocument();
    });
  });

  describe('Rejected Withdrawal', () => {
    it('should display rejected information when status is REJECTED', () => {
      const rejectedWithdrawal: WithdrawalListItem = {
        ...mockWithdrawal,
        status: 'REJECTED',
        rejectedBy: 'admin2',
        rejectedAt: '2024-01-12',
        approvedBy: '',
        approvedAt: ''
      };

      render(
        <WithdrawalDetailModal
          open={true}
          onClose={mockOnClose}
          withdrawal={rejectedWithdrawal}
        />
      );

      expect(screen.getByText('Rejected By')).toBeInTheDocument();
      expect(screen.getByText('admin2')).toBeInTheDocument();
      expect(screen.getByText('Rejected At')).toBeInTheDocument();
    });

    it('should display rejection reason when provided', () => {
      const rejectedWithdrawal: WithdrawalListItem = {
        ...mockWithdrawal,
        status: 'REJECTED',
        rejectedBy: 'admin2',
        rejectedAt: '2024-01-12'
      } as any;

      // Add rejectionReason to the withdrawal object
      (rejectedWithdrawal as any).rejectionReason = 'Invalid bank account';

      render(
        <WithdrawalDetailModal
          open={true}
          onClose={mockOnClose}
          withdrawal={rejectedWithdrawal}
        />
      );

      expect(screen.getByText('Rejection Reason')).toBeInTheDocument();
      expect(screen.getByText('Invalid bank account')).toBeInTheDocument();
    });
  });

  describe('Empty Data Handling', () => {
    it('should display "-" for missing fields', () => {
      const incompleteWithdrawal: WithdrawalListItem = {
        ...mockWithdrawal,
        withdrawalId: '',
        withdrawalName: '',
        eventName: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: ''
      };

      render(
        <WithdrawalDetailModal
          open={true}
          onClose={mockOnClose}
          withdrawal={incompleteWithdrawal}
        />
      );

      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThan(0);
    });
  });
});

