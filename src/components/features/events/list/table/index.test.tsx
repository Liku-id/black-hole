import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import { Event } from '@/types/event';

import EventsTable from './index';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: '1', name: 'Test User', role: 'admin' },
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

describe('EventsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  const mockEvents: Event[] = [
    {
      id: '1',
      name: 'Test Event 1',
      metaUrl: 'test-event-1',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      deletedAt: '',
      eventStatus: 'on_going',
      eventType: 'concert',
      eventOrganizerId: 'org1',
      eventOrganizerName: 'Test Organizer',
      description: 'Test description',
      address: 'Test Address',
      mapLocationUrl: 'https://maps.google.com',
      soldTickets: '100',
      totalRevenue: '5000000',
      city: { id: 'city1', name: 'Jakarta', province: 'DKI Jakarta' } as any,
      paymentMethods: [],
      lowestPriceTicketType: {
        sales_start_date: '2024-01-10'
      } as any,
      eventAssets: [],
      eventCountByStatus: {} as any,
      eventUpdateRequestStatus: null
    },
    {
      id: '2',
      name: 'Test Event 2',
      metaUrl: 'test-event-2',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-05',
      deletedAt: '',
      eventStatus: 'approved',
      eventType: 'festival',
      eventOrganizerId: 'org2',
      eventOrganizerName: 'Test Organizer 2',
      description: 'Test description 2',
      address: 'Test Address 2',
      mapLocationUrl: 'https://maps.google.com',
      soldTickets: '50',
      totalRevenue: '2500000',
      city: { id: 'city2', name: 'Bandung', province: 'Jawa Barat' } as any,
      paymentMethods: [],
      lowestPriceTicketType: null as any,
      eventAssets: [],
      eventCountByStatus: {} as any,
      eventUpdateRequestStatus: null
    }
  ];

  describe('Loading State', () => {
    it('should display loading message when loading is true', () => {
      render(
        <EventsTable
          events={[]}
          loading={true}
        />
      );

      expect(screen.getByText('Loading events...')).toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('should render table headers', () => {
      render(
        <EventsTable
          events={mockEvents}
          loading={false}
        />
      );

      expect(screen.getByText('No.')).toBeInTheDocument();
      expect(screen.getByText('Event Name')).toBeInTheDocument();
      expect(screen.getByText('Event Date')).toBeInTheDocument();
      expect(screen.getByText('Ticket Sold')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render event data', () => {
      render(
        <EventsTable
          events={mockEvents}
          loading={false}
        />
      );

      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    it('should not render Submitted Date and Start Selling Date when isCompact is true', () => {
      render(
        <EventsTable
          events={mockEvents}
          loading={false}
          isCompact={true}
        />
      );

      expect(screen.queryByText('Submitted Date')).not.toBeInTheDocument();
      expect(screen.queryByText('Start Selling Date')).not.toBeInTheDocument();
    });

    it('should render Submitted Date and Start Selling Date when isCompact is false', () => {
      render(
        <EventsTable
          events={mockEvents}
          loading={false}
          isCompact={false}
        />
      );

      expect(screen.getByText('Submitted Date')).toBeInTheDocument();
      expect(screen.getByText('Start Selling Date')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display "No events found" when events array is empty', () => {
      render(
        <EventsTable
          events={[]}
          loading={false}
        />
      );

      expect(screen.getByText('No events found')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should navigate to event detail when view button is clicked', async () => {
      render(
        <EventsTable
          events={[mockEvents[0]]}
          loading={false}
        />
      );

      // Click the Options button to open menu
      const optionsButton = screen.getByAltText('Options').closest('button');
      if (optionsButton) {
        fireEvent.click(optionsButton);
        
        // Then click Event Detail menu item
        const viewButton = await screen.findByAltText('Event Detail');
        fireEvent.click(viewButton);
        expect(mockPush).toHaveBeenCalledWith('/events/test-event-1');
      }
    });

    it('should navigate to tickets page when attendee button is clicked for on_going event', async () => {
      render(
        <EventsTable
          events={[mockEvents[0]]}
          loading={false}
        />
      );

      // Click the Options button to open menu
      const optionsButton = screen.getByAltText('Options').closest('button');
      if (optionsButton) {
        fireEvent.click(optionsButton);
        
        // Then click Attendee Tickets menu item
        const attendeeButton = await screen.findByAltText('Attendee Tickets');
        fireEvent.click(attendeeButton);
        expect(mockPush).toHaveBeenCalledWith('/tickets?event=1');
      }
    });

    it('should render options button for events', async () => {
      render(
        <EventsTable
          events={[mockEvents[1]]}
          loading={false}
        />
      );

      // Just verify the options button exists
      const optionsButton = screen.getByAltText('Options');
      expect(optionsButton).toBeInTheDocument();
    });

    it('should not render action column when showAction is false', () => {
      render(
        <EventsTable
          events={mockEvents}
          loading={false}
          showAction={false}
        />
      );

      expect(screen.queryByText('Action')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should render pagination when total is provided', () => {
      render(
        <EventsTable
          events={mockEvents}
          loading={false}
          total={20}
          currentPage={0}
          pageSize={10}
          onPageChange={jest.fn()}
        />
      );

      expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    });
  });
});

