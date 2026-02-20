import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { TransactionDetailModal } from './index';

// Mock common components
jest.mock('@/components/common', () => ({
  Modal: ({ children, title, footer, open }: any) => 
    open ? (
      <div data-testid="modal">
        <div>{title}</div>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
  Body2: ({ children }: any) => <span>{children}</span>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}));

// Mock StatusBadge
jest.mock('@/components/features/events/status-badge', () => ({
  StatusBadge: ({ status }: { status: string }) => <div data-testid="status-badge">{status}</div>
}));

const mockTransaction = {
  id: '1',
  name: 'Test User',
  event: { name: 'Test Event', adminFee: 5000 },
  ticketType: { name: 'VIP', price: 100000 },
  orderQuantity: 2,
  transactionNumber: 'TRX-123',
  paymentBreakdown: { 
    basedPrice: 200000, 
    tax: 20000,
    totalPrice: 228000 // based + tax + admin + payment method fee
  },
  paymentMethod: { name: 'Credit Card', paymentMethodFee: 3000 },
  createdAt: '2024-01-01T10:00:00Z',
  status: 'paid',
  group_ticket: null
};

describe('TransactionDetailModal', () => {
  it('should not render when open is false', () => {
    render(
      <TransactionDetailModal 
        open={false} 
        onClose={jest.fn()} 
        transaction={mockTransaction as any} 
      />
    );
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should not render when transaction is null', () => {
    render(
      <TransactionDetailModal 
        open={true} 
        onClose={jest.fn()} 
        transaction={null} 
      />
    );
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should render transaction details correctly', () => {
    render(
      <TransactionDetailModal 
        open={true} 
        onClose={jest.fn()} 
        transaction={mockTransaction as any} 
      />
    );

    // Basic Info
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('2 Ticket')).toBeInTheDocument();
    expect(screen.getByText('TRX-123')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('paid')).toBeInTheDocument();

    // Financials
    expect(screen.getByText('Rp 100.000')).toBeInTheDocument(); // Price per ticket
    // Note: Fees are calculated in component:
    // Admin Fee: 5000 (fixed)
    // Payment Fee: 3000 (fixed)
    // Tax: 20000
    // Total: 200000 + 20000 + 5000 + 3000 = 228000
    
    expect(screen.getByText('Rp 5.000')).toBeInTheDocument(); // Admin Fee
    expect(screen.getByText('Rp 3.000')).toBeInTheDocument(); // Transaction Fee
    expect(screen.getByText('Rp 20.000')).toBeInTheDocument(); // Tax
    expect(screen.getByText('Rp 228.000')).toBeInTheDocument(); // Total Payment
  });

  it('should handle percentage fees correctly', () => {
    const percentageFeeTransaction = {
      ...mockTransaction,
      event: { adminFee: 5 }, // 5%
      paymentMethod: { paymentMethodFee: 0.5 }, // 0.5%
      paymentBreakdown: { basedPrice: 100000, tax: 0 }
    };
    // Admin Fee: 5% of 100000 = 5000
    // Payment Fee: 0.5 < 1, so (0.5/100) * 100000 = 500

    render(
      <TransactionDetailModal 
        open={true} 
        onClose={jest.fn()} 
        transaction={percentageFeeTransaction as any} 
      />
    );

    expect(screen.getByText('Rp 5.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 500')).toBeInTheDocument();
  });

  it('should handle group tickets correctly', () => {
    const groupTransaction = {
      ...mockTransaction,
      ticketType: null,
      group_ticket: { name: 'Group Bundle', bundle_quantity: 5 },
      orderQuantity: 2, // 2 bundles
      paymentBreakdown: { basedPrice: 500000 } // 250k per bundle
    };

    render(
      <TransactionDetailModal 
        open={true} 
        onClose={jest.fn()} 
        transaction={groupTransaction as any} 
      />
    );

    expect(screen.getByText('Group Ticket')).toBeInTheDocument();
    expect(screen.getByText('Group Bundle')).toBeInTheDocument();
    expect(screen.getByText('Total Bundle')).toBeInTheDocument();
    expect(screen.getByText('2 Bundle')).toBeInTheDocument();
    expect(screen.getByText('Tickets per Bundle')).toBeInTheDocument();
    expect(screen.getByText('5 Tickets')).toBeInTheDocument();
    expect(screen.getByText('Total Tickets')).toBeInTheDocument();
    expect(screen.getByText('10 Tickets')).toBeInTheDocument(); // 2 * 5
    
    // Price per bundle: 500000 / 2 = 250000
    expect(screen.getByText('Rp 250.000')).toBeInTheDocument();
  });

  it('should call onClose when back button is clicked', () => {
    const onClose = jest.fn();
    render(
      <TransactionDetailModal 
        open={true} 
        onClose={onClose} 
        transaction={mockTransaction as any} 
      />
    );

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    expect(onClose).toHaveBeenCalled();
  });
});
