import { render, screen, fireEvent } from '@testing-library/react';

import { Discount } from '@/services/discounts';
import { GroupTicket, TicketType } from '@/types/event';

import { TicketDetailModal } from './index';

describe('TicketDetailModal', () => {
  const mockOnClose = jest.fn();

  const mockTicket: TicketType = {
    id: 'ticket1',
    name: 'VIP Ticket',
    description: 'VIP description',
    price: 100000,
    quantity: 100,
    purchased_amount: 10,
    max_order_quantity: 5,
    sales_start_date: '2024-01-10T10:00:00Z',
    sales_end_date: '2024-01-20T22:00:00Z',
    ticketStartDate: '2024-01-15T10:00:00Z',
    ticketEndDate: '2024-01-20T22:00:00Z',
    color_hex: 'FF0000',
    is_public: true,
    additional_forms: []
  } as any;

  const mockGroupTicket: GroupTicket = {
    id: 'gt-1',
    ticket_type_id: 'ticket1',
    name: 'Group Bundle 4',
    description: '',
    price: 300000,
    quantity: 40,
    purchased_amount: 4,
    bundle_quantity: 4,
    max_order_quantity: 2,
    sales_start_date: '',
    sales_end_date: '',
    status: 'approved',
    rejected_reason: '',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_public: false,
    ticket_type: {
      ...mockTicket,
      additional_forms: [
        {
          id: 'af-nested',
          field: 'Nested question',
          type: 'TEXT',
          isRequired: false,
          order: 1
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const originalError = console.error;
    jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
      const msg = args.map(String).join(' ');
      if (
        msg.includes('non-boolean attribute') ||
        msg.includes('does not recognize the')
      ) {
        return;
      }
      originalError(...args);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

    it('should handle null ticket gracefully', () => {
      render(
        <TicketDetailModal open={true} onClose={mockOnClose} ticket={null} />
      );

      expect(screen.getByText('Ticket Details')).toBeInTheDocument();
      expect(screen.queryByText('Ticket Name')).not.toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('should render Detail Ticket and Additional Question tabs', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Detail Ticket')).toBeInTheDocument();
      expect(screen.getByText('Additional Question')).toBeInTheDocument();
    });
  });

  describe('Detail Ticket Content', () => {
    it('should display regular ticket fields including color and visibility', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
        />
      );

      expect(screen.getByText('Ticket Name')).toBeInTheDocument();
      expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Quantity Available')).toBeInTheDocument();
      expect(screen.getByText('90 tickets')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('#FF0000')).toBeInTheDocument();
      expect(screen.getByText('VIP description')).toBeInTheDocument();
    });

    it('should display Not set and No when dates are missing and is_public is false', () => {
      const minimalTicket = {
        ...mockTicket,
        sales_start_date: '',
        sales_end_date: '',
        ticketStartDate: '',
        ticketEndDate: '',
        color_hex: '',
        is_public: false,
        description: ''
      };

      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={minimalTicket}
        />
      );

      expect(screen.getAllByText('Not set').length).toBe(4);
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('No description available')).toBeInTheDocument();
      expect(screen.queryByText('Color')).not.toBeInTheDocument();
    });

    it('should display approved percentage and nominal discount prices', () => {
      const percentageDiscount: Discount = {
        id: 'd1',
        ticket_type_id: 'ticket1',
        name: 'Early Bird',
        value: 20,
        start_date: '2024-01-10T00:00:00Z',
        end_date: '2024-01-15T00:00:00Z',
        status: 'approved'
      };

      const { rerender } = render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
          discount={percentageDiscount}
        />
      );

      expect(screen.getByText('Discounted Price')).toBeInTheDocument();
      expect(screen.getByText(/Early Bird: -20%/)).toBeInTheDocument();

      const nominalDiscount: Discount = {
        ...percentageDiscount,
        name: 'Nominal Cut',
        value: 15000
      };

      rerender(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
          discount={nominalDiscount}
        />
      );

      expect(screen.getByText(/Nominal Cut: -Rp/)).toBeInTheDocument();

      const pendingDiscount: Discount = {
        ...percentageDiscount,
        status: 'pending'
      };

      rerender(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockTicket}
          discount={pendingDiscount}
        />
      );

      expect(screen.queryByText('Discounted Price')).not.toBeInTheDocument();
    });

    it('should render group ticket details without tabs and show bundle quantity', () => {
      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={mockGroupTicket}
        />
      );

      expect(screen.getByText('Group Ticket Details')).toBeInTheDocument();
      expect(screen.queryByText('Detail Ticket')).not.toBeInTheDocument();
      expect(screen.queryByText('Additional Question')).not.toBeInTheDocument();
      expect(screen.getByText('Bundle Quantity')).toBeInTheDocument();
      expect(screen.getByText('4 tickets')).toBeInTheDocument();
      expect(screen.queryByText('Ticket Start Date')).not.toBeInTheDocument();
      expect(screen.queryByText('Visibility')).not.toBeInTheDocument();
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

      fireEvent.click(screen.getByText('Additional Question'));

      expect(
        screen.getByText(/Tidak ada pertanyaan tambahan/i)
      ).toBeInTheDocument();
    });

    it('should display active additional forms and exclude deleted ones', () => {
      const ticketWithForms = {
        ...mockTicket,
        additional_forms: [
          {
            id: 'form1',
            field: 'What is your dietary requirement?',
            isRequired: true,
            deletedAt: null
          },
          {
            id: 'form2',
            field: 'T-shirt size',
            isRequired: false,
            deletedAt: null
          },
          {
            id: 'form3',
            field: 'Deleted question',
            isRequired: false,
            deletedAt: '2024-01-05'
          }
        ]
      };

      render(
        <TicketDetailModal
          open={true}
          onClose={mockOnClose}
          ticket={ticketWithForms as any}
        />
      );

      fireEvent.click(screen.getByText('Additional Question'));

      expect(
        screen.getByText(/What is your dietary requirement/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/T-shirt size/i)).toBeInTheDocument();
      expect(screen.queryByText(/Deleted question/i)).not.toBeInTheDocument();
    });
  });
});
