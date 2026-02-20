import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketReviewModal } from './index';

// Mock utils
jest.mock('@/utils', () => ({
  dateUtils: {
    formatDateTimeWIB: () => '2023-01-01 10:00 WIB',
    formatDateDDMMYYYY: () => '01/01/2023',
  },
  formatUtils: {
    formatCurrency: (val: any) => `Rp ${val}`,
  }
}));

const mockTicket = {
  id: 't1',
  name: 'Regular Ticket',
  description: 'Desc',
  price: 100000,
  quantity: 100,
  max_order_quantity: 5,
  sales_start_date: new Date().toISOString(),
  sales_end_date: new Date().toISOString(),
  ticketStartDate: new Date().toISOString(),
  ticketEndDate: new Date().toISOString(),
};

describe('TicketReviewModal', () => {
  it('renders ticket details', () => {
    render(
      <TicketReviewModal
        open={true}
        ticket={mockTicket as any}
        onClose={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
      />
    );
    expect(screen.getByText('Review Ticket: Regular Ticket')).toBeInTheDocument();
  });

  it('handles approval', () => {
    const handleApprove = jest.fn();
    render(
      <TicketReviewModal
        open={true}
        ticket={mockTicket as any}
        onClose={() => {}}
        onApprove={handleApprove}
        onReject={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Approve'));
    expect(handleApprove).toHaveBeenCalledWith('t1');
  });

  it('handles rejection flow', () => {
    const handleReject = jest.fn();
    render(
      <TicketReviewModal
        open={true}
        ticket={mockTicket as any}
        onClose={() => {}}
        onApprove={() => {}}
        onReject={handleReject}
      />
    );
    
    // Enter reject mode
    fireEvent.click(screen.getByText('Reject'));
    
    // Check checkboxes appear
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Select a field to reject (e.g. name)
    fireEvent.click(checkboxes[0]);
    
    // Submit
    fireEvent.click(screen.getByText('Submit Rejection'));
    
    expect(handleReject).toHaveBeenCalled();
    // Verify first argument is ID, second is array of fields
    expect(handleReject.mock.calls[0][0]).toBe('t1');
    expect(Array.isArray(handleReject.mock.calls[0][1])).toBe(true);
  });
});
