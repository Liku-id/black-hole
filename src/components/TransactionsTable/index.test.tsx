import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import TransactionsTable from './index';

jest.mock('@/utils', () => ({
  formatDateDDMMYYYY: () => '01/01/2023',
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
  }
];

describe('TransactionsTable', () => {
  it('renders loading state', () => {
    render(
      <TransactionsTable
        transactions={[]}
        loading={true}
      />
    );
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('renders transactions', () => {
    render(
      <TransactionsTable
        transactions={mockTransactions as any[]}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/ORD1/)).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('selects transactions', () => {
    render(
      <TransactionsTable
        transactions={mockTransactions as any[]}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
  });
});
