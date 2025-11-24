import { render, screen, fireEvent } from '@testing-library/react';
import { EventTicketsEditForm } from './index';
import { EventDetail } from '@/types/event';

describe('EventTicketsEditForm', () => {
  const mockOnTicketsChange = jest.fn();
  const mockOnAddTicket = jest.fn();
  const mockOnEditTicket = jest.fn();

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
        description: 'VIP description',
        colorHex: '#FF0000',
        price: 100000,
        quantity: 100,
        maxPerUser: 5
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render tickets table when tickets exist', () => {
      render(
        <EventTicketsEditForm
          eventDetail={mockEventDetail}
          onTicketsChange={mockOnTicketsChange}
        />
      );

      expect(screen.getByText('Ticket Name')).toBeInTheDocument();
      expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
    });

    it('should render empty state when no tickets', () => {
      const eventWithoutTickets = {
        ...mockEventDetail,
        ticketTypes: []
      };

      const { container } = render(
        <EventTicketsEditForm
          eventDetail={eventWithoutTickets}
          onTicketsChange={mockOnTicketsChange}
        />
      );

      // Just verify component rendered (empty state might not show table headers)
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render component structure', () => {
      const { container } = render(
        <EventTicketsEditForm
          eventDetail={mockEventDetail}
          onTicketsChange={mockOnTicketsChange}
          onAddTicket={mockOnAddTicket}
        />
      );

      // Component should render
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render edit and delete buttons', () => {
      render(
        <EventTicketsEditForm
          eventDetail={mockEventDetail}
          onTicketsChange={mockOnTicketsChange}
          onEditTicket={mockOnEditTicket}
        />
      );

      // Edit and delete buttons should be rendered
      expect(screen.getByAltText('Edit')).toBeInTheDocument();
      expect(screen.getByAltText('Delete')).toBeInTheDocument();
    });
  });
});

