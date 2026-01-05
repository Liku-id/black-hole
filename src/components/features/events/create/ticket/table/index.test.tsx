import { render, screen, fireEvent } from '@testing-library/react';

import TicketTable from './index';

describe('TicketTable', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const mockTickets = [
    {
      id: '1',
      name: 'VIP Ticket',
      description: 'VIP description',
      colorHex: '#FF0000',
      price: 100000,
      quantity: 100,
      maxPerUser: 5,
      salesStartDate: '2024-01-10',
      salesEndDate: '2024-01-20',
      ticketStartDate: '2024-01-15',
      ticketEndDate: '2024-01-20'
    },
    {
      id: '2',
      name: 'Regular Ticket',
      description: 'Regular description',
      colorHex: '#00FF00',
      price: 50000,
      quantity: 200,
      maxPerUser: 10,
      salesStartDate: '2024-01-10',
      salesEndDate: '2024-01-20',
      ticketStartDate: '2024-01-15',
      ticketEndDate: '2024-01-20'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(
        <TicketTable
          tickets={[]}
          loading={true}
        />
      );

      expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('should render table headers', () => {
      render(
        <TicketTable
          tickets={mockTickets}
          loading={false}
        />
      );

      expect(screen.getByText('No.')).toBeInTheDocument();
      expect(screen.getByText('Ticket Name')).toBeInTheDocument();
      expect(screen.getByText('Ticket Price')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Max. Per User')).toBeInTheDocument();
      expect(screen.getByText('Sale Start Date')).toBeInTheDocument();
      expect(screen.getByText('Sale End Date')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render ticket data', () => {
      render(
        <TicketTable
          tickets={mockTickets}
          loading={false}
        />
      );

      expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
      expect(screen.getByText('Regular Ticket')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when tickets array is empty', () => {
      render(
        <TicketTable
          tickets={[]}
          loading={false}
        />
      );

      expect(screen.getByText(/No tickets found|Add your first ticket/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should call onEdit when edit button is clicked', () => {
      render(
        <TicketTable
          tickets={[mockTickets[0]]}
          loading={false}
          onEdit={mockOnEdit}
        />
      );

      const editButton = screen.getByAltText('Edit').closest('button');
      if (editButton) {
        fireEvent.click(editButton);
        expect(mockOnEdit).toHaveBeenCalledWith(mockTickets[0]);
      }
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <TicketTable
          tickets={[mockTickets[0]]}
          loading={false}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByAltText('Delete').closest('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledWith('1');
      }
    });
  });
});

