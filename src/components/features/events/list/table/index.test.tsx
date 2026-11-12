import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useAuth } from '@/contexts/AuthContext';
import { eventsService } from '@/services/events';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { UserRole } from '@/types/auth';
import { Event } from '@/types/event';

import EventsTable from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/services/events', () => ({
  eventsService: {
    duplicateEvent: jest.fn(),
    deleteEvent: jest.fn()
  }
}));

const mockPush = jest.fn();
const mockUseAuth = useAuth as jest.Mock;
const mockDuplicateEvent = eventsService.duplicateEvent as jest.Mock;
const mockDeleteEvent = eventsService.deleteEvent as jest.Mock;

describe('EventsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/',
      query: {},
      asPath: '/'
    });
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Admin User',
        role: { id: 'r1', name: UserRole.ADMIN }
      },
      isAuthenticated: true
    });
  });

  const makeEvent = (overrides: Partial<Event> = {}): Event => ({
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
    eventUpdateRequestStatus: null,
    ...overrides
  });

  const mockEvents: Event[] = [
    makeEvent(),
    makeEvent({
      id: '2',
      name: 'Draft Event',
      metaUrl: 'draft-event',
      eventStatus: 'draft',
      soldTickets: '0',
      totalRevenue: '0',
      lowestPriceTicketType: null as any,
      eventUpdateRequestStatus: 'draft'
    })
  ];

  it('renders loading and empty states across compact and full views', () => {
    const { rerender } = renderWithProviders(
      <EventsTable events={[]} loading={true} />
    );
    expect(screen.getAllByText('Loading events...').length).toBeGreaterThan(0);

    rerender(<EventsTable events={[]} loading={false} isCompact={true} />);
    expect(screen.getAllByText('No events found').length).toBeGreaterThan(0);
    expect(screen.queryByText('Submitted Date')).not.toBeInTheDocument();
  });

  it('renders update request status icons for draft, pending, and rejected statuses', () => {
    renderWithProviders(
      <EventsTable
        events={[
          makeEvent({ id: 'e1', eventUpdateRequestStatus: 'draft' }),
          makeEvent({ id: 'e2', eventUpdateRequestStatus: 'pending' }),
          makeEvent({ id: 'e3', eventUpdateRequestStatus: 'rejected' }),
          makeEvent({ id: 'e4', eventUpdateRequestStatus: 'approved' as any })
        ]}
      />
    );

    expect(screen.getAllByTestId('InfoIcon').length).toBeGreaterThanOrEqual(3);
  });

  it('navigates from all action menu items for on_going event and hides action column when showAction is false', async () => {
    const { rerender } = renderWithProviders(
      <EventsTable events={[mockEvents[0]]} loading={false} />
    );

    const openMenu = () => {
      fireEvent.click(screen.getAllByAltText('Options')[0].closest('button')!);
    };

    openMenu();
    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', { name: /Event Detail/i })
      ).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('menuitem', { name: /Event Detail/i }));
    expect(mockPush).toHaveBeenCalledWith('/events/test-event-1');

    openMenu();
    fireEvent.click(
      screen.getByRole('menuitem', { name: /Attendee Tickets/i })
    );
    expect(mockPush).toHaveBeenCalledWith('/tickets?event=1');

    openMenu();
    fireEvent.click(
      screen.getByRole('menuitem', { name: /Event Transaction/i })
    );
    expect(mockPush).toHaveBeenCalledWith('/finance/event-transactions/1');

    openMenu();
    fireEvent.click(screen.getByRole('menuitem', { name: /Partner Ticket/i }));
    expect(mockPush).toHaveBeenCalledWith(
      '/events/test-event-1/partner-ticket'
    );

    openMenu();
    fireEvent.click(
      screen.getByRole('menuitem', { name: /Invitation Ticket/i })
    );
    expect(mockPush).toHaveBeenCalledWith('/events/test-event-1/invitation');

    rerender(<EventsTable events={mockEvents} showAction={false} />);
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('restricts menu items and status icons for FINANCE and GROUND_STAFF roles', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'fin-1',
        role: { id: 'rf', name: UserRole.FINANCE }
      }
    });

    const { rerender } = renderWithProviders(
      <EventsTable
        events={[makeEvent({ id: '1', eventUpdateRequestStatus: 'pending' })]}
      />
    );
    expect(screen.queryByTestId('InfoIcon')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByAltText('Options')[0].closest('button')!);
    expect(
      screen.queryByRole('menuitem', { name: /Attendee Tickets/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /Event Transaction/i })
    ).toBeInTheDocument();

    mockUseAuth.mockReturnValue({
      user: {
        id: 'gs-1',
        role: { id: 'rg', name: UserRole.GROUND_STAFF }
      }
    });
    rerender(
      <EventsTable
        events={[makeEvent({ id: '2', eventUpdateRequestStatus: 'rejected' })]}
      />
    );
    expect(screen.queryByTestId('InfoIcon')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByAltText('Options')[0].closest('button')!);
    expect(
      screen.queryByRole('menuitem', { name: /Event Transaction/i })
    ).not.toBeInTheDocument();
  });

  it('handles duplicate event confirm success, API error, message error, fallback error, and modal close', async () => {
    const onRefresh = jest.fn();
    mockDuplicateEvent
      .mockRejectedValueOnce({ response: { data: { message: 'API dup err' } } })
      .mockRejectedValueOnce(new Error('Network dup err'))
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce({});

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderWithProviders(
      <EventsTable events={[mockEvents[0]]} onRefresh={onRefresh} />
    );

    fireEvent.click(screen.getAllByAltText('Options')[0].closest('button')!);
    fireEvent.click(screen.getByRole('menuitem', { name: /Duplicate Event/i }));

    fireEvent.click(
      screen.getByRole('button', { name: /Yes, Duplicate Event/i })
    );
    await waitFor(() =>
      expect(screen.getByText('API dup err')).toBeInTheDocument()
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Yes, Duplicate Event/i })
    );
    await waitFor(() =>
      expect(screen.getByText('Network dup err')).toBeInTheDocument()
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Yes, Duplicate Event/i })
    );
    await waitFor(() =>
      expect(
        screen.getByText('Failed to duplicate event. Please try again.')
      ).toBeInTheDocument()
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Yes, Duplicate Event/i })
    );
    await waitFor(() =>
      expect(screen.getByText('Duplicate Event Success!')).toBeInTheDocument()
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Okay/i }));
    expect(
      screen.queryByText('Duplicate Event Success!')
    ).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('handles delete event errors and success', async () => {
    const onRefresh = jest.fn();
    mockDeleteEvent
      .mockRejectedValueOnce({ response: { data: { message: 'API del err' } } })
      .mockRejectedValueOnce(new Error('Network del err'))
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce({});

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderWithProviders(
      <EventsTable events={[mockEvents[1]]} onRefresh={onRefresh} />
    );

    fireEvent.click(screen.getAllByAltText('Options')[0].closest('button')!);
    fireEvent.click(screen.getByRole('menuitem', { name: /Delete Event/i }));

    fireEvent.click(screen.getByRole('button', { name: /Yes, Delete Event/i }));
    await waitFor(() =>
      expect(screen.getByText('API del err')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /Yes, Delete Event/i }));
    await waitFor(() =>
      expect(screen.getByText('Network del err')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /Yes, Delete Event/i }));
    await waitFor(() =>
      expect(
        screen.getByText('Failed to delete event. Please try again.')
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /Yes, Delete Event/i }));
    await waitFor(() =>
      expect(screen.getByText('Delete Event Success!')).toBeInTheDocument()
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Okay/i }));
    expect(screen.queryByText('Delete Event Success!')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('closes delete modal when Cancel is clicked', () => {
    renderWithProviders(<EventsTable events={[mockEvents[1]]} />);

    fireEvent.click(screen.getAllByAltText('Options')[0].closest('button')!);
    fireEvent.click(screen.getByRole('menuitem', { name: /Delete Event/i }));
    expect(
      screen.getByText('Are you sure you want to delete this event?')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(
      screen.queryByText('Are you sure you want to delete this event?')
    ).not.toBeInTheDocument();
  });

  it('triggers pagination onPageChange and closes menu via Escape key', async () => {
    const onPageChange = jest.fn();
    renderWithProviders(
      <EventsTable
        events={mockEvents}
        total={25}
        currentPage={0}
        pageSize={10}
        onPageChange={onPageChange}
      />
    );

    const nextBtns = screen.getAllByTestId('KeyboardArrowRightIcon');
    fireEvent.click(nextBtns[0].closest('button')!);
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getAllByAltText('Options')[0].closest('button')!);
    const menu = await screen.findByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    );
  });
});
