import { fireEvent, render, screen } from '@testing-library/react';

import { PartnerTransactionTable } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('@/components/features/finance/transaction/detail-modal', () => ({
  TransactionDetailModal: ({ open, onClose, transaction }: any) =>
    open ? (
      <div data-testid="tx-detail-modal">
        <span>{transaction?.transactionNumber}</span>
        <button type="button" onClick={onClose}>
          Close Modal
        </button>
      </div>
    ) : null
}));

describe('PartnerTransactionTable', () => {
  const sampleTransactions = [
    {
      id: 'tx-1',
      name: 'John Doe',
      ticketType: { name: 'VIP' },
      orderQuantity: 2,
      transactionNumber: 'ORD-001',
      paymentBreakdown: { totalPrice: 500000 },
      paymentMethod: { name: 'BCA VA' },
      status: 'paid'
    },
    {
      id: 'tx-2',
      name: '',
      ticketType: null,
      orderQuantity: 0,
      transactionNumber: '',
      paymentBreakdown: null,
      paymentMethod: null,
      status: ''
    }
  ];

  it('renders error, loading, and empty states', () => {
    const { rerender } = render(
      <PartnerTransactionTable transactions={[]} error="Network error" />
    );
    expect(
      screen.getByText('Error loading transactions: Network error')
    ).toBeInTheDocument();

    rerender(<PartnerTransactionTable transactions={[]} loading={true} />);
    expect(
      screen.getAllByText('Loading transactions...').length
    ).toBeGreaterThan(0);

    rerender(<PartnerTransactionTable transactions={[]} loading={false} />);
    expect(
      screen.getAllByText('No transactions found.').length
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Showing/i)).not.toBeInTheDocument();
  });

  it('renders transactions, opens and closes TransactionDetailModal, and paginates', () => {
    const onPageChange = jest.fn();

    render(
      <PartnerTransactionTable
        transactions={sampleTransactions}
        total={20}
        currentPage={0}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ORD-001').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);

    // Open modal
    fireEvent.click(screen.getAllByAltText('View')[0].closest('button')!);
    expect(screen.getByTestId('tx-detail-modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
    expect(screen.queryByTestId('tx-detail-modal')).not.toBeInTheDocument();

    // Pagination
    fireEvent.click(
      screen.getAllByTestId('KeyboardArrowRightIcon')[0].closest('button')!
    );
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
