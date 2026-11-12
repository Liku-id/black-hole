import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { useAuth } from '@/contexts/AuthContext';
import { eventOrganizerService } from '@/services/event-organizer';
import {
  createMockEventOrganizer,
  createMockUser
} from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { UserRole } from '@/types/auth';

import DashboardLayout from './index';

const mockPush = jest.fn();
let mockPathname = '/events';

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: mockPathname,
    push: mockPush,
    replace: jest.fn(),
    query: {},
    asPath: mockPathname
  })
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    getAllEventOrganizers: jest.fn()
  }
}));

const mockUseAuth = useAuth as jest.Mock;
const mockGetAllEO = eventOrganizerService.getAllEventOrganizers as jest.Mock;

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockPathname = '/events';
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders admin dashboard, fetches organizers, handles search, selection, outside click, drawer toggle, and logout', async () => {
    const logoutMock = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: createMockUser({
        fullName: 'Admin User',
        role: { id: 'r1', name: UserRole.ADMIN }
      }),
      logout: logoutMock
    });
    mockGetAllEO.mockResolvedValue({
      body: {
        eventOrganizers: [
          { id: 'eo-1', name: 'Organizer One' },
          { id: 'eo-2', name: 'Organizer Two' }
        ]
      }
    });

    const { rerender } = renderWithProviders(
      <DashboardLayout>
        <div data-testid="page-content">Page Body</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();

    // Open EO dropdown via focus
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveValue('All Event Organizer');

    fireEvent.focus(searchInput);

    await waitFor(() => {
      expect(mockGetAllEO).toHaveBeenCalledWith({});
    });

    // Type search query -> debounces 500ms -> calls API with name filter
    fireEvent.change(searchInput, { target: { value: 'Organizer' } });
    act(() => {
      jest.advanceTimersByTime(550);
    });
    await waitFor(() => {
      expect(mockGetAllEO).toHaveBeenCalledWith({ name: 'Organizer' });
    });

    // Select an organizer
    const eoItem = await screen.findByText('Organizer One');
    fireEvent.click(eoItem);
    await waitFor(() => {
      expect(searchInput).toHaveValue('Organizer One');
    });

    // Re-open dropdown, select "All Event Organizer" (id='0'), then test click outside
    fireEvent.focus(searchInput);
    const allOption = await screen.findByText('All Event Organizer');
    fireEvent.click(allOption);
    await waitFor(() => {
      expect(searchInput).toHaveValue('All Event Organizer');
    });

    // Open dropdown again and test outside click listener (attaches after 100ms)
    fireEvent.focus(searchInput);
    act(() => {
      jest.advanceTimersByTime(150);
    });
    fireEvent.mouseDown(screen.getByTestId('page-content'));

    // Trigger profile menu open and logout
    const profileTriggers = screen.getAllByText('Admin User');
    fireEvent.click(profileTriggers[0]);
    const logoutItems = await screen.findAllByText(/Logout/i);
    fireEvent.click(logoutItems[0]);

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });

    // Open mobile drawer and close on route change
    const drawerBtn = screen.getByLabelText('open drawer');
    fireEvent.click(drawerBtn);
    mockPathname = '/dashboard';
    rerender(
      <DashboardLayout>
        <div data-testid="page-content">Page Body</div>
      </DashboardLayout>
    );
  });

  it('handles EO fetch error and logout rejection cleanly', async () => {
    const logoutMock = jest.fn().mockRejectedValue(new Error('logout failed'));
    mockUseAuth.mockReturnValue({
      user: createMockUser({
        fullName: 'Admin User',
        role: { id: 'r1', name: UserRole.ADMIN }
      }),
      logout: logoutMock
    });
    mockGetAllEO.mockRejectedValue(new Error('fetch failed'));

    renderWithProviders(
      <DashboardLayout>
        <div>Body</div>
      </DashboardLayout>
    );

    const searchInput = screen.getByRole('textbox');
    fireEvent.focus(searchInput);
    await waitFor(() => {
      expect(mockGetAllEO).toHaveBeenCalled();
    });

    const profileTriggers = screen.getAllByText('Admin User');
    fireEvent.click(profileTriggers[0]);
    const logoutItems = await screen.findAllByText(/Logout/i);
    fireEvent.click(logoutItems[0]);

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
    });
  });

  it('renders for EventOrganizer PIC user without admin dropdown fetches', () => {
    mockPathname = '/dashboard';
    mockUseAuth.mockReturnValue({
      user: createMockEventOrganizer({ name: 'EO Pic Company' }),
      logout: jest.fn()
    });

    renderWithProviders(
      <DashboardLayout>
        <div>EO Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('EO Content')).toBeInTheDocument();
    expect(mockGetAllEO).not.toHaveBeenCalled();
  });
});
