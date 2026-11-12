import { render, screen, fireEvent } from '@testing-library/react';

import { TicketReviewModal } from './index';

// Mock utils
jest.mock('@/utils', () => ({
  dateUtils: {
    formatDateTimeWIB: () => '2023-01-01 10:00 WIB',
    formatDateDDMMYYYY: () => '01/01/2023'
  },
  formatUtils: {
    formatCurrency: (val: any) => `Rp ${val}`
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
  ticketEndDate: new Date().toISOString()
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
    expect(
      screen.getByText('Review Ticket: Regular Ticket')
    ).toBeInTheDocument();
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

  it('returns null when ticket is null', () => {
    const { container } = render(
      <TicketReviewModal
        open={true}
        ticket={null}
        onApprove={() => {}}
        onClose={() => {}}
        onReject={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders GroupTicket fields, additional forms on regular ticket, error, loading, and cancel/untoggle flows', () => {
    const handleClose = jest.fn();
    const handleReject = jest.fn();

    const regularWithForms = {
      ...mockTicket,
      additional_forms: [
        { id: 'f1', field: 'ID Card', type: 'text', isRequired: true },
        { id: 'f2', field: 'Notes', type: 'text', isRequired: false }
      ]
    };

    const { rerender } = render(
      <TicketReviewModal
        error="Failed review"
        loading={false}
        open={true}
        ticket={regularWithForms as any}
        onApprove={() => {}}
        onClose={handleClose}
        onReject={handleReject}
      />
    );

    expect(screen.getByText('Additional Forms')).toBeInTheDocument();
    expect(screen.getByText(/1\. ID Card \(text\) \*/)).toBeInTheDocument();
    expect(screen.getByText('2. Notes (text)')).toBeInTheDocument();
    expect(screen.getByText('Failed review')).toBeInTheDocument();

    // Enter reject mode, toggle checkbox on then off, then Cancel
    fireEvent.click(screen.getByText('Reject'));
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText('Submit Rejection')).not.toBeDisabled();
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText('Submit Rejection')).toBeDisabled();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Approve')).toBeInTheDocument();

    // Re-enter reject mode & trigger header Close IconButton
    fireEvent.click(screen.getByText('Reject'));
    const closeBtn = screen.getByTestId('CloseIcon').closest('button')!;
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();

    // Render GroupTicket + loading=true
    const groupTicket = {
      id: 'g1',
      ticket_type_id: 't1',
      name: 'Family Pack',
      description: '4 persons',
      price: 350000,
      quantity: 20,
      bundle_quantity: 4,
      max_order_quantity: 2,
      sales_start_date: '2024-01-01T00:00:00Z',
      sales_end_date: '2024-01-02T00:00:00Z'
    };

    rerender(
      <TicketReviewModal
        loading={true}
        open={true}
        ticket={groupTicket as any}
        onApprove={() => {}}
        onClose={handleClose}
        onReject={handleReject}
      />
    );

    expect(
      screen.getByText('Review Group Ticket: Family Pack')
    ).toBeInTheDocument();
    expect(screen.getByText('Bundle Quantity')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.queryByText('Ticket Start Date')).not.toBeInTheDocument();
    expect(screen.getByText('Approving...')).toBeDisabled();
  });
});
