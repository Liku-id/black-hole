import { render, screen, fireEvent } from '@testing-library/react';
import { TicketDetailModal } from './index';
import { TicketType } from '@/types/event';

describe('TicketDetailModal', () => {
  const mockOnClose = jest.fn();

  const mockTicket: TicketType = {
    id: 'ticket1',
    name: 'VIP Ticket',
    description: 'VIP description',
    price: 100000,
    quantity: 100,
    max_order_quantity: 5,
    sales_start_date: '2024-01-10T10:00:00Z',
    sales_end_date: '2024-01-20T22:00:00Z',
    ticketStartDate: '2024-01-15T10:00:00Z',
    ticketEndDate: '2024-01-20T22:00:00Z',
    color_hex: 'FF0000',
    additional_forms: []
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Ticket Details')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <TicketDetailModal
          open={false}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.queryByText('Ticket Details')).not.toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('should render Detail Ticket tab', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Detail Ticket')).toBeInTheDocument();
    });

    it('should render Additional Question tab', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Additional Question')).toBeInTheDocument();
    });
  });

  describe('Detail Ticket Content', () => {
    it('should display ticket name', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Ticket Name')).toBeInTheDocument();
      expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
    });

    it('should display ticket price', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Price')).toBeInTheDocument();
    });

    it('should display quantity available', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Quantity Available')).toBeInTheDocument();
    });

    it('should display description', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('VIP description')).toBeInTheDocument();
    });
  });

  describe('Additional Question Content', () => {
    it('should display empty message when no additional forms', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      // Switch to Additional Question tab
      const additionalTab = screen.getByText('Additional Question');
      fireEvent.click(additionalTab);

      expect(
        screen.getByText(/Tidak ada pertanyaan tambahan/i)
      ).toBeInTheDocument();
    });

    it('should display additional forms when available', () => {
      const ticketWithForms = {
        ...mockTicket,
        additional_forms: [
          {
            id: 'form1',
            field: 'What is your dietary requirement?',
            isRequired: true,
            deletedAt: null
          }
        ]
      };

      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={ticketWithForms}
        />
      );

      // Switch to Additional Question tab
      const additionalTab = screen.getByText('Additional Question');
      fireEvent.click(additionalTab);

      expect(screen.getByText(/What is your dietary requirement/i)).toBeInTheDocument();
    });
  });
});


