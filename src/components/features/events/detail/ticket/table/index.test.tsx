import { render, screen, fireEvent } from '@testing-library/react';
import { EventDetailTicketTable } from './index';
import { TicketType } from '@/types/event';

describe('EventDetailTicketTable', () => {
  const mockTickets: TicketType[] = [
    {
      id: 'ticket1',
      name: 'VIP Ticket',
      price: 100000,
      quantity: 100,
      max_order_quantity: 5,
      sales_start_date: '2024-01-10T10:00:00Z',
      sales_end_date: '2024-01-20T22:00:00Z',
      color_hex: 'FF0000'
    } as any,
    {
      id: 'ticket2',
      name: 'Regular Ticket',
      price: 50000,
      quantity: 200,
      max_order_quantity: 10,
      sales_start_date: '2024-01-10T10:00:00Z',
      sales_end_date: '2024-01-20T22:00:00Z',
      color_hex: '00FF00'
    } as any
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(
        <EventDetailTicketTable
          ticketTypes={[]}
          loading={true}
        />
      );

      expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('should render table headers', () => {
      render(
        <EventDetailTicketTable
          ticketTypes={mockTickets}
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
        <EventDetailTicketTable
          ticketTypes={mockTickets}
          loading={false}
        />
      );

      expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
      expect(screen.getByText('Regular Ticket')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display "No tickets found" when tickets array is empty', () => {
      render(
        <EventDetailTicketTable
          ticketTypes={[]}
          loading={false}
        />
      );

      expect(screen.getByText('No tickets found.')).toBeInTheDocument();
    });
  });

  describe('Modal Interaction', () => {
    it('should open modal when view detail icon is clicked', () => {
      render(
        <EventDetailTicketTable
          ticketTypes={[mockTickets[0]]}
          loading={false}
        />
      );

      const viewButton = screen.getByAltText('View detail').closest('div');
      if (viewButton) {
        fireEvent.click(viewButton);
        // Modal should open (check for modal title)
        expect(screen.getByText('Ticket Details')).toBeInTheDocument();
      }
    });
  });
});


