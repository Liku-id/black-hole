import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import EventsTable from './index';
import { Event } from '@/types/event';

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
      eventCountByStatus: {} as any
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
      eventCountByStatus: {} as any
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
    it('should navigate to event detail when view button is clicked', () => {
      render(
        <EventsTable
          events={[mockEvents[0]]}
          loading={false}
        />
      );

      const viewButton = screen.getByAltText('View').closest('button');
      if (viewButton) {
        fireEvent.click(viewButton);
        expect(mockPush).toHaveBeenCalledWith('/events/test-event-1');
      }
    });

    it('should navigate to tickets page when attendee button is clicked for on_going event', () => {
      render(
        <EventsTable
          events={[mockEvents[0]]}
          loading={false}
        />
      );

      const attendeeButton = screen.getByAltText('tickets').closest('button');
      if (attendeeButton) {
        fireEvent.click(attendeeButton);
        expect(mockPush).toHaveBeenCalledWith('/tickets?event=1');
      }
    });

    it('should disable attendee button for non-ongoing/done events', () => {
      render(
        <EventsTable
          events={[mockEvents[1]]}
          loading={false}
        />
      );

      const attendeeButton = screen.getByAltText('tickets').closest('button');
      if (attendeeButton) {
        expect(attendeeButton).toBeDisabled();
      }
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

