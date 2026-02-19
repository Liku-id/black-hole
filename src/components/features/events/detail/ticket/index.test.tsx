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
    login_required: false,
    group_tickets: []
  };

  describe('Rendering', () => {
    it('should render "Event Ticket" title', () => {
      render(<EventDetailTicket eventDetail={mockEventDetail} />);

      expect(screen.getByText('Event Ticket')).toBeInTheDocument();
    });

    it('should render "Ticket Category" label', () => {
      render(<EventDetailTicket eventDetail={mockEventDetail} />);

      const labels = screen.getAllByText('Ticket Category');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should render edit button for editable events', () => {
      const editableEvent = {
        ...mockEventDetail,
        eventStatus: 'draft'
      };

      render(<EventDetailTicket eventDetail={editableEvent} />);

      expect(screen.getByText('Edit Ticket')).toBeInTheDocument();
    });


    it('should not render edit buttons for done events', () => {
      const doneEvent = {
        ...mockEventDetail,
        eventStatus: 'done'
      };

      render(<EventDetailTicket eventDetail={doneEvent} />);

      expect(screen.queryByText('Edit Ticket')).not.toBeInTheDocument();
    });

  });

  describe('Navigation', () => {
    it('should navigate to edit tickets page when edit button is clicked', () => {
      const editableEvent = {
        ...mockEventDetail,
        eventStatus: 'draft'
      };

      render(<EventDetailTicket eventDetail={editableEvent} />);

      const editButton = screen.getByText('Edit Ticket');
      fireEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event/tickets');
    });


  });
});


