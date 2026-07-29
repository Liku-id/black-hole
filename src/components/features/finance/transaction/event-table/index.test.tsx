import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { EventTransactionTable } from './index';

// Mock child components
jest.mock('@/components/features/events/status-badge', () => ({
  StatusBadge: ({ status }: { status: string }) => <div data-testid="status-badge">{status}</div>
}));

jest.mock('../detail-modal', () => ({
  TransactionDetailModal: ({ open, onClose }: { open: boolean; onClose: () => void }) => 
    open ? (
      <div data-testid="detail-modal">
        Modal Content
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

// Mock common components
jest.mock('@/components/common', () => {
  const { CollapsibleCardListMock } = require('@/test-utils/collapsible-card-list-mock');
  return {
    Body2: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CollapsibleCardList: CollapsibleCardListMock,
    Pagination: () => <div data-testid="pagination">Pagination</div>,
    StyledTableContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    StyledTableHead: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
    StyledTableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>
  };
});

const mockTransactions = [
  {
    id: '1',
    name: 'User 1',
    ticketType: { name: 'VIP Ticket' },
    orderQuantity: 2,
    transactionNumber: 'TRX-123',
    paymentBreakdown: { totalPrice: 1000000 },
    paymentMethod: { name: 'Credit Card' },
    createdAt: '2024-01-01T10:00:00Z',
    status: 'paid',
    group_ticket: null
  },
  {
    id: '2',
    name: 'User 2',
    ticketType: null,
    group_ticket: { name: 'Group Bundle', bundle_quantity: 5 },
    orderQuantity: 1,
    transactionNumber: 'TRX-456',
    paymentBreakdown: { totalPrice: 2500000 },
    paymentMethod: { name: 'Bank Transfer' },
    createdAt: '2024-01-02T11:00:00Z',
    status: 'pending'
  }
];

describe('EventTransactionTable', () => {
  describe('Loading and Error States', () => {
    it('should display loading message', () => {
      render(<EventTransactionTable transactions={[]} loading={true} />);
      expect(screen.getAllByText('Loading transactions...').length).toBeGreaterThan(0);
    });

    it('should display error message', () => {
      render(
        <EventTransactionTable 
          transactions={[]} 
          loading={false} 
          error="Failed to load" 
        />
      );
      expect(screen.getByText('Error loading transactions: Failed to load')).toBeInTheDocument();
    });

    it('should display empty state', () => {
      render(<EventTransactionTable transactions={[]} loading={false} />);
      expect(screen.getAllByText('No transactions found.').length).toBeGreaterThan(0);
    });
  });

  describe('Data Rendering', () => {
    it('should render table structure', () => {
      render(
        <EventTransactionTable 
          transactions={mockTransactions as any[]} 
          loading={false} 
        />
      );

      // Check Headers
      expect(screen.getByText('No.')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Ticket Qty')).toBeInTheDocument();
      expect(screen.getByText('Transaction ID')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render transaction data correctly', () => {
      render(
        <EventTransactionTable 
          transactions={mockTransactions as any[]} 
          loading={false} 
        />
      );

      // Row 1 - Regular Ticket
      expect(screen.getAllByText('User 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('VIP Ticket').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2 Ticket').length).toBeGreaterThan(0);
      expect(screen.getAllByText('TRX-123').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Credit Card').length).toBeGreaterThan(0);
      expect(screen.getAllByText('paid').length).toBeGreaterThan(0);

      expect(screen.getAllByText('User 2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Group Bundle').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1 Bundle \(5 Tickets\)/).length).toBeGreaterThan(0);
      expect(screen.getAllByText('TRX-456').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Bank Transfer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('pending').length).toBeGreaterThan(0);
    });
  });

  describe('Interaction', () => {
    it('should open modal when view button is clicked', () => {
      render(
        <EventTransactionTable 
          transactions={mockTransactions as any[]} 
          loading={false} 
        />
      );

      // Modal should be closed initially
      expect(screen.queryByTestId('detail-modal')).not.toBeInTheDocument();

      // Click view button (first row)
      const viewButton = screen.getAllByAltText('View')[0].closest('button');
      fireEvent.click(viewButton!);

      // Modal should be open
      expect(screen.getByTestId('detail-modal')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', () => {
      render(
        <EventTransactionTable 
          transactions={mockTransactions as any[]} 
          loading={false} 
        />
      );

      // Open modal
      const viewButton = screen.getAllByAltText('View')[0].closest('button');
      fireEvent.click(viewButton!);
      expect(screen.getByTestId('detail-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      // Modal should be closed
      expect(screen.queryByTestId('detail-modal')).not.toBeInTheDocument();
    });
  });
});
