import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/features/events/useEvents';

import EventCreation from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/hooks/features/events/useEvents', () => ({
  useEvents: jest.fn()
}));

jest.mock('@/components/features/events/list/table', () => ({
  __esModule: true,
  default: ({ onPageChange, onRefresh }: any) => (
    <div data-testid="events-table">
      <button
        type="button"
        data-testid="mock-page-change"
        onClick={() => onPageChange(2)}
      >
        Next Page
      </button>
      <button type="button" data-testid="mock-refresh" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  )
}));

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

const mockUseEvents = useEvents as jest.MockedFunction<typeof useEvents>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('EventCreation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockUseAuth.mockReturnValue({
      user: {
        organizer_type: 'individual',
        ktp_photo_id: 'ktp1',
        npwp_photo_id: 'npwp1',
        nik: '123456789',
        npwp: '123456789',
        ktp_address: 'Address',
        pic_name: 'PIC Name'
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
    mockUseEvents.mockReturnValue({
      events: [],
      eventCountByStatus: { onGoing: 5, approved: 3, done: 2 } as any,
      loading: false,
      error: null,
      mutate: jest.fn(),
      pagination: { totalRecords: 10 } as any
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('navigates on Create New Event buttons, switches tabs, and debounces search', () => {
    render(<EventCreation />);

    // Both Create New Event buttons (header & empty state) enabled for complete individual EO
    const createButtons = screen.getAllByRole('button', {
      name: 'Create New Event'
    });
    expect(createButtons).toHaveLength(2);
    fireEvent.click(createButtons[0]);
    fireEvent.click(createButtons[1]);
    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenCalledWith('/events/create');

    // Switch tab
    fireEvent.click(screen.getByText(/Upcoming/i));
    expect(mockUseEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'EVENT_STATUS_APPROVED', page: 0 })
    );

    // Search debounce (1000ms)
    const searchInput = screen.getByPlaceholderText('Cari Event');
    fireEvent.change(searchInput, { target: { value: 'Rock Concert' } });
    expect(searchInput).toHaveValue('Rock Concert');
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockUseEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'Rock Concert', page: 0 })
    );
  });

  it('handles EventsTable pagination, error state, and organizer completeness checks', () => {
    mockUseEvents.mockReturnValue({
      events: [{ id: 'e1', name: 'Event 1' }] as any,
      eventCountByStatus: null,
      loading: false,
      error: null,
      mutate: jest.fn(),
      pagination: { totalRecords: 20 } as any
    });

    // Incomplete individual EO -> button disabled
    mockUseAuth.mockReturnValue({
      user: {
        organizer_type: 'individual',
        ktp_photo_id: 'ktp1'
      } as any
    } as any);

    const { rerender } = render(<EventCreation />);
    expect(
      screen.getByRole('button', { name: 'Create New Event' })
    ).toBeDisabled();

    // EventsTable pagination callback
    fireEvent.click(screen.getByTestId('mock-page-change'));
    expect(mockUseEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 })
    );

    // Institutional complete EO -> enabled
    mockUseAuth.mockReturnValue({
      user: {
        organizer_type: 'institutional',
        npwp_photo_id: 'n1',
        npwp: '123',
        npwp_address: 'Jl. Sudirman',
        full_name: 'PT Maju'
      } as any
    } as any);
    rerender(<EventCreation eventOrganizerId="org-99" />);
    expect(
      screen.getByRole('button', { name: 'Create New Event' })
    ).toBeEnabled();
    expect(mockUseEvents).toHaveBeenLastCalledWith(
      expect.objectContaining({ event_organizer_id: 'org-99' })
    );

    // Unknown organizer_type + error state
    mockUseAuth.mockReturnValue({
      user: { organizer_type: 'other' } as any
    } as any);
    mockUseEvents.mockReturnValue({
      events: [],
      eventCountByStatus: null,
      loading: false,
      error: 'Connection refused',
      mutate: jest.fn(),
      pagination: null
    });
    rerender(<EventCreation />);
    expect(
      screen.getByRole('button', { name: 'Create New Event' })
    ).toBeDisabled();
    expect(screen.getByText('Failed to load events')).toBeInTheDocument();
    expect(screen.getByText('Connection refused')).toBeInTheDocument();
  });

  it('disables button for non-organizer and renders non-empty missing organizer_type cleanly', () => {
    mockUseAuth.mockReturnValue({
      user: { role: { name: 'admin' } } as any
    } as any);
    const { rerender } = render(<EventCreation />);
    expect(
      screen.getAllByRole('button', { name: 'Create New Event' })[0]
    ).toBeDisabled();

    mockUseAuth.mockReturnValue({
      user: { organizer_type: '' } as any
    } as any);
    rerender(<EventCreation />);
    expect(
      screen.getAllByRole('button', { name: 'Create New Event' })[0]
    ).toBeDisabled();
  });
});
