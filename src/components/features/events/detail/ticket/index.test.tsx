import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import { EventDetail } from '@/types/event';

import { EventDetailTicket } from './index';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

describe('EventDetailTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const mockEventDetail: EventDetail = {
    id: '1',
    name: 'Test Event',
    metaUrl: 'test-event',
    eventStatus: 'approved',
    is_requested: false,
    eventType: 'concert',
    description: 'Test description',
    address: 'Test Address',
    mapLocationUrl: 'https://maps.google.com',
    termAndConditions: 'Test terms',
    websiteUrl: 'https://test.com',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    ticketTypes: [
      {
        id: 'ticket1',
        name: 'VIP Ticket',
        price: 100000,
        quantity: 100,
        max_order_quantity: 5
      } as any
    ],
    tickets: [],
    city: { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' } as any,
    eventOrganizer: {} as any,
    paymentMethods: [],
    adminFee: 5,
    tax: 10,
    feeThresholds: [],
    eventAssets: [],
    rejectedReason: null,
    rejectedFields: null,
    withdrawalFee: '0',
    login_required: false
  };

  describe('Rendering', () => {
    it('should render "Event Detail Ticket" title', () => {
      render(<EventDetailTicket eventDetail={mockEventDetail} />);

      expect(screen.getByText('Event Detail Ticket')).toBeInTheDocument();
    });

    it('should render "Ticket Category" label', () => {
      render(<EventDetailTicket eventDetail={mockEventDetail} />);

      expect(screen.getByText('Ticket Category')).toBeInTheDocument();
    });

    it('should render edit button for editable events', () => {
      const editableEvent = {
        ...mockEventDetail,
        eventStatus: 'draft'
      };

      render(<EventDetailTicket eventDetail={editableEvent} />);

      expect(screen.getByText('Edit Ticket Detail')).toBeInTheDocument();
    });

    it('should render additional form button for editable events', () => {
      const editableEvent = {
        ...mockEventDetail,
        eventStatus: 'draft'
      };

      render(<EventDetailTicket eventDetail={editableEvent} />);

      expect(screen.getByText('Additional Form')).toBeInTheDocument();
    });

    it('should not render edit buttons for done events', () => {
      const doneEvent = {
        ...mockEventDetail,
        eventStatus: 'done'
      };

      render(<EventDetailTicket eventDetail={doneEvent} />);

      expect(screen.queryByText('Edit Ticket Detail')).not.toBeInTheDocument();
      expect(screen.queryByText('Additional Form')).not.toBeInTheDocument();
    });

    it('should disable additional form button when no tickets', () => {
      const eventWithoutTickets = {
        ...mockEventDetail,
        eventStatus: 'draft',
        ticketTypes: []
      };

      render(<EventDetailTicket eventDetail={eventWithoutTickets} />);

      const additionalFormButton = screen.getByText('Additional Form');
      expect(additionalFormButton).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to edit tickets page when edit button is clicked', () => {
      const editableEvent = {
        ...mockEventDetail,
        eventStatus: 'draft'
      };

      render(<EventDetailTicket eventDetail={editableEvent} />);

      const editButton = screen.getByText('Edit Ticket Detail');
      fireEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event/tickets');
    });

    it('should navigate to additional form page when additional form button is clicked', () => {
      const editableEvent = {
        ...mockEventDetail,
        eventStatus: 'draft'
      };

      render(<EventDetailTicket eventDetail={editableEvent} />);

      const additionalFormButton = screen.getByText('Additional Form');
      fireEvent.click(additionalFormButton);

      expect(mockPush).toHaveBeenCalledWith(
        '/events/edit/test-event/tickets/additional-form'
      );
    });
  });
});


