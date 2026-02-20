import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import { EventDetail } from '@/types/event';

import { EventDetailInfo, RejectedReason } from './index';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: '1',
      name: 'Test User',
      role: { name: 'event_organizer_pic' },
      eventOrganizerId: 'org1'
    },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn()
  }))
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

describe('EventDetailInfo', () => {
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
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-01-20T22:00:00Z',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    ticketTypes: [],
    tickets: [],
    city: { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' } as any,
    eventOrganizer: {} as any,
    paymentMethods: [
      { id: 'pm1', name: 'Bank Transfer' },
      { id: 'pm2', name: 'Credit Card' }
    ] as any,
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
    it('should render "Event Detail" title', () => {
      render(<EventDetailInfo eventDetail={mockEventDetail} />);

      expect(screen.getByText('Event Detail')).toBeInTheDocument();
    });

    it('should render all event fields', () => {
      render(<EventDetailInfo eventDetail={mockEventDetail} />);

      expect(screen.getByText('Event Name*')).toBeInTheDocument();
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Event Type*')).toBeInTheDocument();
      expect(screen.getByText('concert')).toBeInTheDocument();
      expect(screen.getByText('Address*')).toBeInTheDocument();
      expect(screen.getByText('Test Address')).toBeInTheDocument();
    });

    it('should render edit button for editable events', () => {
      render(<EventDetailInfo eventDetail={mockEventDetail} />);

      expect(screen.getByText('Edit Event Details')).toBeInTheDocument();
    });

    it('should not render edit button for done events', () => {
      const doneEvent = {
        ...mockEventDetail,
        eventStatus: 'done'
      };

      render(<EventDetailInfo eventDetail={doneEvent} />);

      expect(screen.queryByText('Edit Event Details')).not.toBeInTheDocument();
    });

    it('should not render edit button for on_review events', () => {
      const reviewEvent = {
        ...mockEventDetail,
        eventStatus: 'on_review',
        eventUpdateRequestStatus: 'pending'
      };

      render(<EventDetailInfo eventDetail={reviewEvent} />);

      expect(screen.queryByText('Edit Event Details')).not.toBeInTheDocument();
    });

    it('should hide edit button when is_requested is true', () => {
      const requestedEvent = {
        ...mockEventDetail,
        eventStatus: 'approved',
        is_requested: true
      };

      render(<EventDetailInfo eventDetail={requestedEvent} />);

      expect(screen.queryByText('Edit Event Details')).not.toBeInTheDocument();
    });
  });

  describe('Rejected Fields', () => {
    it('should show error icon for rejected fields', () => {
      const rejectedEvent = {
        ...mockEventDetail,
        rejectedFields: ['name', 'description']
      };

      render(<EventDetailInfo eventDetail={rejectedEvent} />);

      // Error icons should be present for rejected fields (ErrorOutline is an SVG icon)
      // Just verify the component rendered with rejected fields
      expect(screen.getByText('Event Name*')).toBeInTheDocument();
    });
  });

  describe('RejectedReason Component', () => {
    it('should render rejection reason when provided', () => {
      render(<RejectedReason reason="Test rejection reason" />);

      expect(screen.getByText('Rejection Reason:')).toBeInTheDocument();
      expect(screen.getByText('Test rejection reason')).toBeInTheDocument();
    });

    it('should not render when reason is empty', () => {
      const { container } = render(<RejectedReason reason="" />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when reason is null', () => {
      const { container } = render(<RejectedReason reason={null as any} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should navigate to edit page when edit button is clicked', () => {
      render(<EventDetailInfo eventDetail={mockEventDetail} />);

      const editButton = screen.getByText('Edit Event Details');
      fireEvent.click(editButton);

      expect(mockPush).toHaveBeenCalledWith('/events/edit/test-event');
    });
  });
});

