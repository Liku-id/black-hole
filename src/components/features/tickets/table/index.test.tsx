import { fireEvent, render, screen } from '@testing-library/react';

import TicketListTable from './index';

jest.mock('@/utils', () => ({
  formatDateDDMMYYYY: () => '01/01/2023'
}));

const mockTickets = [
  {
    id: 't1',
    ticketNumber: 'T001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    ticketType: 'VIP',
    price: 100000,
    purchaseDate: '2023-01-01',
    status: 'active',
    eventName: 'Concert',
    seatNumber: 'A1'
  },
  {
    id: 't2',
    ticketNumber: 'T002',
    customerName: 'Jane Roe',
    customerEmail: 'jane@example.com',
    ticketType: 'Regular',
    price: 50000,
    purchaseDate: '2023-01-02',
    usedDate: '2023-01-05',
    status: 'used',
    eventName: 'Concert'
  },
  {
    id: 't3',
    ticketNumber: 'T003',
    customerName: 'Sam',
    customerEmail: 'sam@example.com',
    ticketType: 'Early',
    price: 25000,
    purchaseDate: '2023-01-03',
    status: 'expired',
    eventName: 'Concert'
  },
  {
    id: 't4',
    ticketNumber: 'T004',
    customerName: 'Alex',
    customerEmail: 'alex@example.com',
    ticketType: 'Normal',
    price: 75000,
    purchaseDate: '2023-01-04',
    status: 'cancelled',
    eventName: 'Concert'
  },
  {
    id: 't5',
    ticketNumber: 'T005',
    customerName: 'Pat',
    customerEmail: 'pat@example.com',
    ticketType: 'Normal',
    price: 75000,
    purchaseDate: '2023-01-05',
    status: 'unknown_status' as any,
    eventName: 'Concert'
  }
];

describe('TicketListTable', () => {
  it('renders tickets across all status labels, seatNumber, usedDate, and refresh action', () => {
    const onRefresh = jest.fn();
    render(
      <TicketListTable tickets={mockTickets as any[]} onRefresh={onRefresh} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/T001/)).toBeInTheDocument();
    expect(screen.getByText(/Seat: A1/)).toBeInTheDocument();
    expect(screen.getByText(/Used: 01\/01\/2023/)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Used')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('handles loading state', () => {
    render(<TicketListTable tickets={[]} loading={true} />);
    expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
  });

  it('handles individual and select-all checkboxes and pagination controls', () => {
    const onPageChange = jest.fn();
    const onLimitChange = jest.fn();

    render(
      <TicketListTable
        tickets={mockTickets as any[]}
        pagination={{
          currentPage: 0,
          totalItems: 50,
          limit: 10,
          totalPages: 5,
          hasNext: true,
          hasPrev: false
        }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Select first row then deselect
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).not.toBeChecked();

    // Select all then deselect all
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[1]).not.toBeChecked();

    // Pagination next page
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    // Rows per page change
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: '25' }));
    expect(onLimitChange).toHaveBeenCalledWith(25);
  });
});
