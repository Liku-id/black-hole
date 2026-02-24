import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import TicketListTable from './index';

jest.mock('@/utils', () => ({
  formatDateDDMMYYYY: () => '01/01/2023',
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
  }
];

describe('TicketListTable', () => {
  it('renders tickets', () => {
    render(
      <TicketListTable
        tickets={mockTickets as any[]}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/T001/)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(
      <TicketListTable
        tickets={[]}
        loading={true}
      />
    );
    expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
  });

  it('selects tickets', () => {
    render(
      <TicketListTable
        tickets={mockTickets as any[]}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    // First one is header select all, second is row
    fireEvent.click(checkboxes[1]); 
    expect(checkboxes[1]).toBeChecked();
  });
});
