import { render, screen, fireEvent } from '@testing-library/react';

import TransactionsTable from './index';

jest.mock('@/utils', () => ({
  formatDateDDMMYYYY: () => '01/01/2023'
}));

const mockTransactions = [
  {
    id: 'tx1',
    orderId: 'ORD1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    ticketType: 'VIP',
    quantity: 1,
    totalAmount: 100000,
    paymentMethod: 'CC',
    status: 'completed',
    transactionDate: '2023-01-01',
    paymentDate: '2023-01-02',
    refundAmount: 10000,
    refundDate: '2023-01-03',
    paymentBreakdown: {
      basedPrice: 80000,
      fee: 10000,
      tax: 10000,
      totalPrice: 100000
    }
  },
  {
    id: 'tx2',
    orderId: 'ORD2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    ticketType: 'Reg',
    quantity: 2,
    totalAmount: 50000,
    paymentMethod: 'VA',
    status: 'pending',
    transactionDate: '2023-01-04',
    refundAmount: 5000
  },
  {
    id: 'tx3',
    orderId: 'ORD3',
    customerName: 'Bob',
    customerEmail: 'bob@example.com',
    ticketType: 'Reg',
    quantity: 1,
    totalAmount: 25000,
    paymentMethod: 'QRIS',
    status: 'failed',
    transactionDate: '2023-01-05'
  },
  {
    id: 'tx4',
    orderId: 'ORD4',
    customerName: 'Alice',
    customerEmail: 'alice@example.com',
    ticketType: 'Reg',
    quantity: 1,
    totalAmount: 25000,
    paymentMethod: 'QRIS',
    status: 'cancelled',
    transactionDate: '2023-01-06'
  },
  {
    id: 'tx5',
    orderId: 'ORD5',
    customerName: 'Eve',
    customerEmail: 'eve@example.com',
    ticketType: 'Reg',
    quantity: 1,
    totalAmount: 25000,
    paymentMethod: 'QRIS',
    status: 'other' as any,
    transactionDate: '2023-01-07'
  }
];

describe('TransactionsTable', () => {
  it('renders loading state', () => {
    render(<TransactionsTable transactions={[]} loading={true} />);
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('renders transactions with statuses, breakdown, refunds, pagination, and refresh', () => {
    const onRefresh = jest.fn();
    const onPageChange = jest.fn();
    const onLimitChange = jest.fn();

    render(
      <TransactionsTable
        transactions={mockTransactions as any[]}
        onRefresh={onRefresh}
        pagination={{
          currentPage: 0,
          totalItems: 20,
          limit: 5,
          totalPages: 4,
          hasNext: true,
          hasPrev: false
        }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/ORD1/)).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText(/Paid: 01\/01\/2023/)).toBeInTheDocument();
    expect(screen.getByText(/Base:/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Refresh'));
    expect(onRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(onPageChange).toHaveBeenCalledWith(1);

    const rowsSelect = screen.getByLabelText('Rows per page:');
    fireEvent.mouseDown(rowsSelect);
    fireEvent.click(screen.getByRole('option', { name: '10' }));
    expect(onLimitChange).toHaveBeenCalledWith(10);
  });

  it('selects one, deselects one, and selects/deselects all transactions', () => {
    render(<TransactionsTable transactions={mockTransactions as any[]} />);
    const checkboxes = screen.getAllByRole('checkbox');

    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[0]).toHaveAttribute('data-indeterminate', 'true');

    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).not.toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[1]).toBeChecked();

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[1]).not.toBeChecked();
  });
});
