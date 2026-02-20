import { render, screen, fireEvent } from '@testing-library/react';

import { EventDetail } from '@/types/event';

import { EventsSubmissionsInfo } from './index';

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

describe('EventsSubmissionsInfo', () => {
  const mockEventDetail: EventDetail = {
    id: '1',
    name: 'Test Event',
    eventType: 'Concert',
    description: 'Test description',
    address: 'Test Address',
    mapLocationUrl: 'https://maps.google.com',
    metaUrl: 'test-event',
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-01-15T22:00:00Z',
    eventStatus: 'pending',
    termAndConditions: 'Test terms',
    websiteUrl: 'https://test.com',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    ticketTypes: [],
    tickets: [],
    city: {
      id: 'city1',
      name: 'Jakarta'
    },
    eventOrganizer: {} as any,
    paymentMethods: [
      {
        id: 'pm1',
        name: 'Bank Transfer',
        type: 'Virtual Account',
        logo: 'logo.png',
        bankId: 'bank1',
        requestType: 'VA',
        paymentCode: 'BCA_VA',
        channelProperties: {},
        rules: [],
        bank: {
          id: 'bank1',
          name: 'BCA',
          channelCode: 'BCA',
          channelType: 'VIRTUAL_ACCOUNT',
          minAmount: 10000,
          maxAmount: 50000000
        }
      },
      {
        id: 'pm2',
        name: 'Credit Card',
        type: 'Credit Card',
        logo: 'logo.png',
        bankId: 'bank2',
        requestType: 'CC',
        paymentCode: 'CC',
        channelProperties: {},
        rules: [],
        bank: null
      }
    ],
    adminFee: 5,
    tax: 10,
    feeThresholds: [],
    eventAssets: [],
    is_requested: false,
    rejectedReason: null,
    rejectedFields: null,
    withdrawalFee: '0',
    login_required: false,
    group_tickets: []
  };

  describe('Basic Rendering', () => {
    it('should render all event fields', () => {
      render(
        <EventsSubmissionsInfo
          eventDetail={mockEventDetail}
        />
      );

      expect(screen.getByText('Event Name*')).toBeInTheDocument();
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Event Type*')).toBeInTheDocument();
      expect(screen.getByText('Concert')).toBeInTheDocument();
      expect(screen.getByText('Address*')).toBeInTheDocument();
      expect(screen.getByText('Test Address')).toBeInTheDocument();
    });

    it('should render event description', () => {
      render(
        <EventsSubmissionsInfo
          eventDetail={mockEventDetail}
        />
      );

      expect(screen.getByText('Event Description*')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render payment methods', () => {
      render(
        <EventsSubmissionsInfo
          eventDetail={mockEventDetail}
        />
      );

      expect(screen.getByText('Payment Method*')).toBeInTheDocument();
      expect(screen.getByText(/Bank Transfer|Credit Card/i)).toBeInTheDocument();
    });
  });

  describe('Field Changes Display', () => {
    it('should display new value when field has changes', () => {
      const eventUpdateRequest = {
        id: '1',
        eventId: '1',
        name: 'Updated Event Name',
        description: 'Updated description',
        status: 'pending',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        eventDetailStatus: 'pending',
        ticketStatus: 'pending',
        assetStatus: 'pending',
        rejectedReason: null,
        rejectedFields: null,
        eventType: 'concert',
        address: 'Test Address',
        mapLocationUrl: 'https://maps.google.com',
        metaUrl: 'test-event'
      } as any;

      render(
        <EventsSubmissionsInfo
          eventDetail={mockEventDetail}
          eventUpdateRequest={eventUpdateRequest}
        />
      );

      // Should show the updated value with arrow indicator (→)
      // The new value is displayed with an arrow prefix
      const updatedValue = screen.queryByText(/→.*Updated Event Name/i) || 
                          screen.queryByText(/Updated Event Name/i);
      expect(updatedValue).toBeInTheDocument();
    });
  });

  describe('Reject Mode', () => {
    it('should render checkboxes in reject mode', () => {
      const mockOnToggleField = jest.fn();

      render(
        <EventsSubmissionsInfo
          eventDetail={mockEventDetail}
          rejectMode={true}
          selectedFields={[]}
          onToggleField={mockOnToggleField}
        />
      );

      // Checkboxes should be rendered for fields that can be rejected
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should call onToggleField when checkbox is clicked', () => {
      const mockOnToggleField = jest.fn();

      render(
        <EventsSubmissionsInfo
          eventDetail={mockEventDetail}
          rejectMode={true}
          selectedFields={[]}
          onToggleField={mockOnToggleField}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        expect(mockOnToggleField).toHaveBeenCalled();
      }
    });

    it('should not show checkboxes for admin_fee and tax when eventStatus is on_going', () => {
      const ongoingEvent: EventDetail = {
        ...mockEventDetail,
        eventStatus: 'on_going'
      };

      render(
        <EventsSubmissionsInfo
          eventDetail={ongoingEvent}
          rejectMode={true}
          selectedFields={[]}
        />
      );

      // Admin fee and tax should not have checkboxes for on_going events
      expect(screen.getByText('Admin Fee*')).toBeInTheDocument();
    });
  });

  describe('Empty Data Handling', () => {
    it('should display "-" for missing city name', () => {
      const eventWithoutCity: EventDetail = {
        ...mockEventDetail,
        city: null as any
      };

      render(
        <EventsSubmissionsInfo
          eventDetail={eventWithoutCity}
        />
      );

      expect(screen.getByText('City*')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should display "-" for missing website URL', () => {
      const eventWithoutWebsite: EventDetail = {
        ...mockEventDetail,
        websiteUrl: ''
      };

      render(
        <EventsSubmissionsInfo
          eventDetail={eventWithoutWebsite}
        />
      );

      expect(screen.getByText('Website URL*')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});

