import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Discount, discountsService } from '@/services/discounts';
import { GroupTicket, TicketType } from '@/types/event';

import { EventDetailTicketTable } from './index';

jest.mock('@/services/discounts', () => ({
  discountsService: {
    createDiscount: jest.fn(),
    updateDiscount: jest.fn(),
    deleteDiscount: jest.fn(),
    approveRejectDiscount: jest.fn()
  }
}));

jest.mock('./modal/DiscountModal', () => ({
  DiscountModal: ({
    open,
    onClose,
    ticket,
    discount,
    onSave,
    onDelete,
    onApproveReject
  }: any) =>
    open ? (
      <div data-testid="discount-modal">
        <span>{ticket?.name}</span>
        <span>{discount ? discount.name : 'no-discount'}</span>
        <button
          onClick={() =>
            onSave({
              ticket_type_id: ticket.id,
              name: 'Saved Disc',
              value: 15,
              start_date: '2026-01-01',
              end_date: '2026-01-02'
            })
          }
        >
          TriggerSaveDiscount
        </button>
        <button onClick={() => onDelete('disc-1')}>
          TriggerDeleteDiscount
        </button>
        <button onClick={() => onApproveReject('disc-1', 'approved')}>
          TriggerApproveDiscount
        </button>
        <button onClick={onClose}>CloseDiscountModal</button>
      </div>
    ) : null
}));

jest.mock('@/components/features/approval/events/modal/ticket-review', () => ({
  TicketReviewModal: ({ open, ticket, onClose, onApprove, onReject }: any) =>
    open ? (
      <div data-testid="ticket-review-modal">
        <span>Review {ticket?.name}</span>
        <button onClick={() => onApprove(ticket.id)}>ApproveTicketBtn</button>
        <button onClick={() => onReject(ticket.id, ['name'])}>
          RejectTicketBtn
        </button>
        <button onClick={onClose}>CloseReviewBtn</button>
      </div>
    ) : null
}));

describe('EventDetailTicketTable', () => {
  const mockTickets: TicketType[] = [
    {
      id: 'ticket1',
      name: 'VIP Ticket',
      price: 100000,
      quantity: 100,
      purchased_amount: 10,
      max_order_quantity: 5,
      sales_start_date: '2024-01-10T10:00:00Z',
      sales_end_date: '2024-01-20T22:00:00Z',
      color_hex: 'FF0000',
      is_public: true,
      status: 'approved'
    } as any,
    {
      id: 'ticket2',
      name: 'Regular Ticket',
      price: 50000,
      quantity: 200,
      purchased_amount: 0,
      max_order_quantity: 10,
      sales_start_date: '',
      sales_end_date: '',
      color_hex: '00FF00',
      is_public: false,
      status: 'pending'
    } as any
  ];

  const mockGroupTickets: GroupTicket[] = [
    {
      id: 'group1',
      ticket_type_id: 'ticket1',
      name: 'Group Pack',
      description: '4 tickets pack',
      price: 300000,
      quantity: 50,
      purchased_amount: 5,
      bundle_quantity: 4,
      max_order_quantity: 2,
      sales_start_date: '2024-01-10T10:00:00Z',
      sales_end_date: '2024-01-20T22:00:00Z',
      status: 'rejected',
      rejected_reason: '',
      created_at: '',
      updated_at: '',
      is_public: true,
      ticket_type: mockTickets[0]
    }
  ];

  const mockDiscounts: Discount[] = [
    {
      id: 'disc-1',
      ticket_type_id: 'ticket1',
      name: 'VIP Promo',
      value: 20,
      start_date: '2024-01-10T00:00:00Z',
      end_date: '2024-01-15T00:00:00Z',
      status: 'approved'
    },
    {
      id: 'disc-2',
      ticket_type_id: 'ticket2',
      name: 'Pending Promo',
      value: 15000,
      start_date: '2024-01-10T00:00:00Z',
      end_date: '2024-01-15T00:00:00Z',
      status: 'pending'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (discountsService.createDiscount as jest.Mock).mockResolvedValue({});
    (discountsService.updateDiscount as jest.Mock).mockResolvedValue({});
    (discountsService.deleteDiscount as jest.Mock).mockResolvedValue({});
    (discountsService.approveRejectDiscount as jest.Mock).mockResolvedValue({});

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

  describe('Loading and Empty States', () => {
    it('should display loading message when loading is true', () => {
      render(<EventDetailTicketTable ticketTypes={[]} loading={true} />);

      expect(screen.getAllByText('Loading tickets...').length).toBeGreaterThan(
        0
      );
    });

    it('should display "No tickets found." when tickets array is empty', () => {
      render(<EventDetailTicketTable ticketTypes={[]} loading={false} />);

      expect(screen.getAllByText('No tickets found.').length).toBeGreaterThan(
        0
      );
    });
  });

  describe('Table Rendering & Discounts', () => {
    it('should render table headers and regular ticket rows with approved & pending discounts', () => {
      const approvedNominalDiscount: Discount = {
        ...mockDiscounts[0],
        value: 20000
      };

      render(
        <EventDetailTicketTable
          ticketTypes={mockTickets}
          discounts={[approvedNominalDiscount, mockDiscounts[1]]}
          showStatus={true}
        />
      );

      expect(screen.getByText('No.')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getAllByText('VIP Ticket').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Regular Ticket').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Disc: pending').length).toBeGreaterThan(0);
    });

    it('should render percentage approved discount and missing status fallback', () => {
      const noStatusTicket = { ...mockTickets[0], status: undefined };

      render(
        <EventDetailTicketTable
          ticketTypes={[noStatusTicket as any]}
          discounts={[mockDiscounts[0]]}
          showStatus={true}
        />
      );

      expect(screen.getAllByText('-20%').length).toBeGreaterThan(0);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should expand mobile collapsible card list details', () => {
      render(
        <EventDetailTicketTable
          ticketTypes={mockTickets}
          discounts={mockDiscounts}
          showStatus={true}
          onTogglePublic={jest.fn()}
        />
      );

      const cardToggle = screen.getByRole('button', {
        name: /1\. VIP Ticket/i
      });
      fireEvent.click(cardToggle);

      expect(screen.getAllByText('90/100').length).toBeGreaterThan(0);
    });
  });

  describe('Interactions: Modals, Visibility, and Additional Forms', () => {
    it('should open TicketDetailModal when viewing approved ticket or group ticket', () => {
      render(
        <EventDetailTicketTable
          ticketTypes={[mockTickets[0], ...mockGroupTickets] as any}
          discounts={mockDiscounts}
        />
      );

      const viewIcons = screen.getAllByAltText('View detail');
      fireEvent.click(viewIcons[0]);
      expect(screen.getByText('Ticket Details')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Close'));
      expect(screen.queryByText('Ticket Details')).not.toBeInTheDocument();

      fireEvent.click(screen.getAllByAltText('View detail')[1]);
      expect(screen.getByText('Group Ticket Details')).toBeInTheDocument();
    });

    it('should open TicketReviewModal in approvalMode for pending tickets and trigger approve/reject', () => {
      const onApproveTicket = jest.fn();
      const onRejectTicket = jest.fn();

      render(
        <EventDetailTicketTable
          ticketTypes={[mockTickets[1]]}
          approvalMode={true}
          onApproveTicket={onApproveTicket}
          onRejectTicket={onRejectTicket}
        />
      );

      fireEvent.click(screen.getAllByAltText('View detail')[0]);
      expect(screen.getByTestId('ticket-review-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('RejectTicketBtn'));
      expect(onRejectTicket).toHaveBeenCalledWith('ticket2', ['name']);

      fireEvent.click(screen.getByText('ApproveTicketBtn'));
      expect(onApproveTicket).toHaveBeenCalledWith('ticket2');
      expect(
        screen.queryByTestId('ticket-review-modal')
      ).not.toBeInTheDocument();
    });

    it('should handle visibility switch and additional form callback', () => {
      const onTogglePublic = jest.fn();
      const onEditAdditionalForm = jest.fn();

      render(
        <EventDetailTicketTable
          ticketTypes={mockTickets}
          onTogglePublic={onTogglePublic}
          onEditAdditionalForm={onEditAdditionalForm}
          visibilityLoadingId="ticket2"
        />
      );

      const switches = screen.getAllByRole('checkbox');
      // Desktop table switch for ticket1
      fireEvent.click(switches[0]);
      expect(onTogglePublic).toHaveBeenCalledWith('ticket1', false);

      const editFormIcons = screen.getAllByAltText('Edit Additional Form');
      fireEvent.click(editFormIcons[0]);
      expect(onEditAdditionalForm).toHaveBeenCalledWith('ticket1');
    });

    it('should open DiscountModal for creating, updating, deleting, and approving discounts', async () => {
      const onDiscountsChange = jest.fn().mockResolvedValue(undefined);

      const { rerender } = render(
        <EventDetailTicketTable
          ticketTypes={[mockTickets[0]]}
          discounts={[]}
          sessionRole="admin"
          onDiscountsChange={onDiscountsChange}
        />
      );

      fireEvent.click(screen.getAllByAltText('Manage Discount')[0]);
      expect(screen.getByTestId('discount-modal')).toBeInTheDocument();
      expect(screen.getByText('no-discount')).toBeInTheDocument();

      fireEvent.click(screen.getByText('TriggerSaveDiscount'));
      await waitFor(() => {
        expect(discountsService.createDiscount).toHaveBeenCalled();
      });
      expect(onDiscountsChange).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('CloseDiscountModal'));
      expect(screen.queryByTestId('discount-modal')).not.toBeInTheDocument();

      rerender(
        <EventDetailTicketTable
          ticketTypes={[mockTickets[0]]}
          discounts={[mockDiscounts[0]]}
          sessionRole="admin"
          approvalMode={true}
          onDiscountsChange={onDiscountsChange}
        />
      );

      fireEvent.click(screen.getAllByAltText('Review Discount')[0]);
      expect(screen.getByText('VIP Promo')).toBeInTheDocument();

      fireEvent.click(screen.getByText('TriggerSaveDiscount'));
      await waitFor(() => {
        expect(discountsService.updateDiscount).toHaveBeenCalledWith(
          'disc-1',
          expect.objectContaining({ name: 'Saved Disc' })
        );
      });

      fireEvent.click(screen.getByText('TriggerDeleteDiscount'));
      await waitFor(() => {
        expect(discountsService.deleteDiscount).toHaveBeenCalledWith('disc-1');
      });

      fireEvent.click(screen.getByText('TriggerApproveDiscount'));
      await waitFor(() => {
        expect(discountsService.approveRejectDiscount).toHaveBeenCalledWith(
          'disc-1',
          { status: 'approved', rejected_reason: undefined }
        );
      });
    });
  });
});
