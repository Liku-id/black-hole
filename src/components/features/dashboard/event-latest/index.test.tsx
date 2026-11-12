import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { useFilteredEvents } from '@/hooks';

import EventLatestView from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/hooks', () => ({
  useFilteredEvents: jest.fn()
}));

jest.mock('../organizer-status', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('div', null, 'OrganizerRegStatus')
  };
});

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/',
  query: {},
  asPath: '/'
};

const mockUseFilteredEvents = useFilteredEvents as jest.MockedFunction<
  typeof useFilteredEvents
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('EventLatestView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseAuth.mockReturnValue({
      user: { role: { name: 'admin' } } as any,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      refreshUserData: jest.fn(),
      error: null
    });
  });

  const sampleOngoing = [
    {
      id: 'ev-1',
      name: 'Ongoing Concert',
      metaUrl: 'ongoing-concert',
      address: 'Jakarta',
      date: '2026-05-15T10:00:00Z',
      time: '10:00',
      totalRevenue: 5000000,
      thumbnail: '/thumb1.jpg'
    },
    {
      id: 'ev-2',
      name: 'Second Ongoing Event',
      metaUrl: 'second-ongoing',
      address: 'Bandung',
      date: '2026-05-20T12:00:00Z',
      time: '12:00',
      totalRevenue: 1500000,
      thumbnail: ''
    }
  ];

  const samplePast = [
    {
      id: 'ev-3',
      name: 'Past Festival',
      metaUrl: 'past-festival',
      address: 'Bali',
      date: '2025-01-10T10:00:00Z',
      time: '10:00',
      totalRevenue: 2500000,
      thumbnail: '/thumb3.jpg'
    }
  ];

  it('renders Ongoing and Past event cards, opens menu items, navigates sections, and triggers image fallbacks', async () => {
    mockUseFilteredEvents
      .mockReturnValueOnce({
        events: sampleOngoing as any,
        loading: false,
        error: null,
        mutate: jest.fn()
      })
      .mockReturnValueOnce({
        events: samplePast as any,
        loading: false,
        error: null,
        mutate: jest.fn()
      });

    render(<EventLatestView eventOrganizerId="org-1" />);

    expect(screen.getByText('Ongoing Concert')).toBeInTheDocument();
    expect(screen.getByText('Second Ongoing Event')).toBeInTheDocument();
    expect(screen.getByText('Past Festival')).toBeInTheDocument();

    // Section header arrows
    const arrowIcons = screen.getAllByAltText('arrow');
    fireEvent.click(arrowIcons[0]);
    expect(mockPush).toHaveBeenCalledWith(
      '/events?status=EVENT_STATUS_ON_GOING'
    );
    fireEvent.click(arrowIcons[1]);
    expect(mockPush).toHaveBeenCalledWith('/events?status=EVENT_STATUS_DONE');

    // Open menu on first card and navigate all 3 actions
    const optionsIcons = screen.getAllByAltText('options');
    fireEvent.click(optionsIcons[0].closest('button')!);
    fireEvent.click(screen.getByText('Event Detail'));
    expect(mockPush).toHaveBeenCalledWith('/events/ongoing-concert');

    fireEvent.click(optionsIcons[0].closest('button')!);
    fireEvent.click(screen.getByText('Attendee Tickets'));
    expect(mockPush).toHaveBeenCalledWith('/tickets?event=ev-1');

    fireEvent.click(optionsIcons[0].closest('button')!);
    fireEvent.click(screen.getByText('Event Transactions'));
    expect(mockPush).toHaveBeenCalledWith('/finance/event-transactions/ev-1');

    // Open and close menu with Escape + image onError handlers
    fireEvent.click(optionsIcons[0].closest('button')!);
    const menu = await screen.findByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    );

    const thumb = screen.getByAltText('Ongoing Concert') as HTMLImageElement;
    fireEvent.error(thumb);
    expect(thumb.src).toContain('/placeholder-event.jpg');
    fireEvent.error(arrowIcons[0]);
    fireEvent.error(optionsIcons[0]);
    fireEvent.error(screen.getAllByAltText('Jakarta')[0]);
  });

  it('renders empty state for admin and OrganizerRegStatus for event organizer', () => {
    mockUseFilteredEvents
      .mockReturnValueOnce({
        events: [],
        loading: false,
        error: null,
        mutate: jest.fn()
      })
      .mockReturnValueOnce({
        events: [],
        loading: false,
        error: null,
        mutate: jest.fn()
      });

    render(<EventLatestView />);
    expect(screen.getByText('no ongoing events')).toBeInTheDocument();
    expect(screen.getByText('no past events')).toBeInTheDocument();
    fireEvent.error(screen.getAllByAltText('empty events')[0]);

    // Organizer role -> shows OrganizerRegStatus
    mockUseAuth.mockReturnValue({
      user: {
        role: { name: 'event_organizer_pic' },
        organizer_type: 'individual'
      } as any,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
      refreshUserData: jest.fn(),
      error: null
    });
    mockUseFilteredEvents
      .mockReturnValueOnce({
        events: [],
        loading: false,
        error: null,
        mutate: jest.fn()
      })
      .mockReturnValueOnce({
        events: [],
        loading: false,
        error: null,
        mutate: jest.fn()
      });

    render(<EventLatestView />);
    expect(screen.getByText('OrganizerRegStatus')).toBeInTheDocument();
  });

  it('renders loading skeletons and handles retry clicks on ongoing & past errors', () => {
    const refetchOngoing = jest.fn();
    const refetchPast = jest.fn();

    mockUseFilteredEvents
      .mockReturnValueOnce({
        events: [],
        loading: true,
        error: null,
        mutate: jest.fn()
      })
      .mockReturnValueOnce({
        events: [],
        loading: true,
        error: null,
        mutate: jest.fn()
      });

    const { rerender } = render(<EventLatestView />);
    expect(screen.getByText('Event On Going')).toBeInTheDocument();

    mockUseFilteredEvents
      .mockReturnValueOnce({
        events: [],
        loading: false,
        error: 'Ongoing failed',
        mutate: refetchOngoing
      })
      .mockReturnValueOnce({
        events: [],
        loading: false,
        error: 'Past failed',
        mutate: refetchPast
      });

    rerender(<EventLatestView />);
    const retryIcons = screen.getAllByAltText('retry');
    fireEvent.error(retryIcons[0]);
    fireEvent.click(retryIcons[0].closest('button')!);
    fireEvent.click(retryIcons[1].closest('button')!);
    expect(refetchOngoing).toHaveBeenCalledTimes(1);
    expect(refetchPast).toHaveBeenCalledTimes(1);
  });
});
