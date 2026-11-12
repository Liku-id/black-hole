import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { mutate } from 'swr';

import { authService } from '@/services';
import {
  createMockEventOrganizer,
  createMockUser
} from '@/test-utils/factories';
import { UserRole } from '@/types/auth';
import { apiUtils } from '@/utils/apiUtils';

import { AuthProvider, useAuth } from './AuthContext';

const mockReplace = jest.fn();
let mockQuery: Record<string, string> = {};

jest.mock('next/router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    get query() {
      return mockQuery;
    },
    pathname: '/login',
    asPath: '/login'
  })
}));

jest.mock('swr', () => ({
  mutate: jest.fn()
}));

jest.mock('@/services', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
    getEventOrganizerMe: jest.fn()
  }
}));

jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

const mockApiGet = apiUtils.get as jest.Mock;
const mockApiPost = apiUtils.post as jest.Mock;
const mockAuthService = authService as jest.Mocked<typeof authService>;

const AuthConsumer = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    refreshUserData
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="auth">{String(isAuthenticated)}</div>
      <div data-testid="user">{user ? (user as any).email : 'none'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => login({ email: 'a@b.com', password: 'pw' })}>
        login
      </button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => clearError()}>clear-error</button>
      <button onClick={() => refreshUserData()}>refresh</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {};
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const Broken = () => {
      useAuth();
      return null;
    };
    expect(() => render(<Broken />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });

  describe('restoreSession on mount', () => {
    it('completes unauthenticated when session has no valid auth', async () => {
      mockApiGet.mockResolvedValue({ isAuthenticated: false });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );
      expect(screen.getByTestId('auth')).toHaveTextContent('false');
    });

    it('clears session if restored user role is not allowed', async () => {
      mockApiGet.mockResolvedValue({
        isAuthenticated: true,
        user: { role: UserRole.BUYER }
      });
      mockApiPost.mockResolvedValue({});

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );
      expect(mockApiPost).toHaveBeenCalledWith('/api/auth/clear-session');
      expect(screen.getByTestId('auth')).toHaveTextContent('false');
    });

    it('restores event_organizer_pic via getEventOrganizerMe', async () => {
      const eo = createMockEventOrganizer();
      mockApiGet.mockResolvedValue({
        isAuthenticated: true,
        user: { role: UserRole.EVENT_ORGANIZER_PIC }
      });
      mockAuthService.getEventOrganizerMe.mockResolvedValue({
        statusCode: 0,
        body: eo
      } as any);

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('auth')).toHaveTextContent('true')
      );
      expect(screen.getByTestId('user')).toHaveTextContent(eo.email);
    });

    it('falls back to getMe when getEventOrganizerMe fails during restore', async () => {
      const user = createMockUser();
      mockApiGet.mockResolvedValue({
        isAuthenticated: true,
        user: { role: UserRole.EVENT_ORGANIZER_PIC }
      });
      mockAuthService.getEventOrganizerMe.mockResolvedValue({
        statusCode: 1,
        body: null
      } as any);
      mockAuthService.getMe.mockResolvedValue({
        statusCode: 0,
        body: user
      } as any);

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('auth')).toHaveTextContent('true')
      );
      expect(screen.getByTestId('user')).toHaveTextContent(user.email);
    });

    it('handles getMe failure and session request failure during restore', async () => {
      mockApiGet.mockRejectedValueOnce(new Error('initial restore failure'));

      const { unmount } = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );
      expect(screen.getByTestId('auth')).toHaveTextContent('false');
      unmount();

      // EO restore fallback fails completely
      mockApiGet.mockResolvedValueOnce({
        isAuthenticated: true,
        user: { role: UserRole.EVENT_ORGANIZER_PIC }
      });
      mockAuthService.getEventOrganizerMe.mockResolvedValueOnce({
        statusCode: 1
      } as any);
      mockAuthService.getMe.mockResolvedValueOnce({ statusCode: 1 } as any);

      const secondRender = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );
      secondRender.unmount();

      // Admin getMe failure on restore + refresh failure
      mockApiGet.mockResolvedValue({
        isAuthenticated: true,
        user: { role: UserRole.ADMIN }
      });
      mockAuthService.getMe.mockResolvedValue({ statusCode: 1 } as any);

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );
      expect(screen.getByTestId('auth')).toHaveTextContent('false');

      mockApiGet.mockRejectedValueOnce(new Error('network error'));
      fireEvent.click(screen.getByText('refresh'));
      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );
    });
  });

  describe('refreshUserData', () => {
    it('refreshes user data for non-EO, EO fallback, unauthorized role, and unauthenticated session', async () => {
      const admin = createMockUser({ email: 'refreshed@wukong.co.id' });
      mockApiGet.mockResolvedValue({ isAuthenticated: false });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );

      // 1) Admin refresh success
      mockApiGet.mockResolvedValueOnce({
        isAuthenticated: true,
        user: { role: UserRole.ADMIN }
      });
      mockAuthService.getMe.mockResolvedValueOnce({
        statusCode: 0,
        body: admin
      } as any);
      fireEvent.click(screen.getByText('refresh'));
      await waitFor(() =>
        expect(screen.getByTestId('user')).toHaveTextContent(
          'refreshed@wukong.co.id'
        )
      );

      // 2) Unauthorized role clears session
      mockApiGet.mockResolvedValueOnce({
        isAuthenticated: true,
        user: { role: UserRole.GUEST }
      });
      fireEvent.click(screen.getByText('refresh'));
      await waitFor(() =>
        expect(mockApiPost).toHaveBeenCalledWith('/api/auth/clear-session')
      );

      // 3) EO PIC success and fallback failure
      const eo = createMockEventOrganizer({ email: 'eo-refresh@wukong.co.id' });
      mockApiGet.mockResolvedValueOnce({
        isAuthenticated: true,
        user: { role: UserRole.EVENT_ORGANIZER_PIC }
      });
      mockAuthService.getEventOrganizerMe.mockResolvedValueOnce({
        statusCode: 0,
        body: eo
      } as any);
      fireEvent.click(screen.getByText('refresh'));
      await waitFor(() =>
        expect(screen.getByTestId('user')).toHaveTextContent(
          'eo-refresh@wukong.co.id'
        )
      );

      mockApiGet.mockResolvedValueOnce({
        isAuthenticated: true,
        user: { role: UserRole.EVENT_ORGANIZER_PIC }
      });
      mockAuthService.getEventOrganizerMe.mockRejectedValueOnce(
        new Error('err')
      );
      mockAuthService.getMe.mockResolvedValueOnce({
        statusCode: 0,
        body: createMockUser({ email: 'fallback-refresh@wukong.co.id' })
      } as any);
      fireEvent.click(screen.getByText('refresh'));
      await waitFor(() =>
        expect(screen.getByTestId('user')).toHaveTextContent(
          'fallback-refresh@wukong.co.id'
        )
      );

      // Non-EO getMe failure on refresh
      mockApiGet.mockResolvedValueOnce({
        isAuthenticated: true,
        user: { role: UserRole.ADMIN }
      });
      mockAuthService.getMe.mockResolvedValueOnce({ statusCode: 1 } as any);
      fireEvent.click(screen.getByText('refresh'));
      await waitFor(() => expect(mockAuthService.getMe).toHaveBeenCalled());

      // EO fallback also fails getMe during refresh
      mockApiGet.mockResolvedValueOnce({
        isAuthenticated: true,
        user: { role: UserRole.EVENT_ORGANIZER_PIC }
      });
      mockAuthService.getEventOrganizerMe.mockResolvedValueOnce({
        statusCode: 1
      } as any);
      mockAuthService.getMe.mockResolvedValueOnce({ statusCode: 1 } as any);
      fireEvent.click(screen.getByText('refresh'));
      await waitFor(() => expect(mockAuthService.getMe).toHaveBeenCalled());

      // 4) No valid session on refresh
      mockApiGet.mockResolvedValueOnce({ isAuthenticated: false });
      fireEvent.click(screen.getByText('refresh'));
      await waitFor(() => expect(mockApiGet).toHaveBeenCalled());
    });
  });

  describe('login, logout, and clearError', () => {
    it('logs in different roles and redirects appropriately', async () => {
      mockApiGet.mockResolvedValue({ isAuthenticated: false });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );

      // Cashier -> /ots
      mockAuthService.login.mockResolvedValueOnce({
        body: { user: { role: UserRole.CASHIER } }
      } as any);
      mockAuthService.getMe.mockResolvedValueOnce({
        statusCode: 0,
        body: createMockUser({ role: { id: 'r', name: UserRole.CASHIER } })
      } as any);
      fireEvent.click(screen.getByText('login'));
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/ots'));

      // Ground staff -> /events
      mockAuthService.login.mockResolvedValueOnce({
        body: { user: { role: UserRole.GROUND_STAFF } }
      } as any);
      mockAuthService.getMe.mockResolvedValueOnce({
        statusCode: 0,
        body: createMockUser({ role: { id: 'r', name: UserRole.GROUND_STAFF } })
      } as any);
      fireEvent.click(screen.getByText('login'));
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/events'));

      // EO PIC with fallback and allowed redirect query
      mockQuery = { redirect: 'https://bo-staging-aws.wukong.co.id/events' };
      mockAuthService.login.mockResolvedValueOnce({
        body: { user: { role: UserRole.EVENT_ORGANIZER_PIC } }
      } as any);
      mockAuthService.getEventOrganizerMe.mockResolvedValueOnce({
        statusCode: 1
      } as any);
      mockAuthService.getMe.mockResolvedValueOnce({
        statusCode: 0,
        body: createMockUser()
      } as any);
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(mockReplace).toHaveBeenCalledWith(
          'https://bo-staging-aws.wukong.co.id/events'
        )
      );

      // Finance -> /events
      mockAuthService.login.mockResolvedValueOnce({
        body: { user: { role: UserRole.FINANCE } }
      } as any);
      mockAuthService.getMe.mockResolvedValueOnce({
        statusCode: 0,
        body: createMockUser({ role: { id: 'r', name: UserRole.FINANCE } })
      } as any);
      fireEvent.click(screen.getByText('login'));
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/events'));

      // EO PIC direct success -> /dashboard
      mockQuery = {};
      mockAuthService.login.mockResolvedValueOnce({
        body: { user: { role: UserRole.EVENT_ORGANIZER_PIC } }
      } as any);
      mockAuthService.getEventOrganizerMe.mockResolvedValueOnce({
        statusCode: 0,
        body: createMockEventOrganizer()
      } as any);
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(mockReplace).toHaveBeenCalledWith('/dashboard')
      );
    });

    it('handles login errors (Error, axios-like object with message, ROLE_NOT_ALLOWED, invalid response) and clearError', async () => {
      mockApiGet.mockResolvedValue({ isAuthenticated: false });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );

      // Invalid login response
      mockAuthService.login.mockResolvedValueOnce({} as any);
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to authenticate user'
        )
      );

      fireEvent.click(screen.getByText('clear-error'));
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');

      // Axios-like object with message
      mockAuthService.login.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } }
      });
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Invalid credentials'
        )
      );

      // ROLE_NOT_ALLOWED code
      mockAuthService.login.mockRejectedValueOnce({
        response: { data: { code: 'ROLE_NOT_ALLOWED' } }
      });
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Access denied. Your role is not authorized to access this platform.'
        )
      );

      // Non-Error / empty response fallback -> Login failed
      mockAuthService.login.mockRejectedValueOnce({
        response: { data: {} }
      });
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed')
      );

      mockAuthService.login.mockRejectedValueOnce('unknown error');
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(screen.getByTestId('error')).toHaveTextContent('Login failed')
      );

      // getMe fails after login
      mockAuthService.login.mockResolvedValueOnce({
        body: { user: { role: UserRole.ADMIN } }
      } as any);
      mockAuthService.getMe.mockResolvedValueOnce({ statusCode: 1 } as any);
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to get user data'
        )
      );

      // EO fallback getMe fails after login
      mockAuthService.login.mockResolvedValueOnce({
        body: { user: { role: UserRole.EVENT_ORGANIZER_PIC } }
      } as any);
      mockAuthService.getEventOrganizerMe.mockRejectedValueOnce(
        new Error('fail')
      );
      mockAuthService.getMe.mockResolvedValueOnce({ statusCode: 1 } as any);
      fireEvent.click(screen.getByText('login'));
      await waitFor(() =>
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Failed to get user data'
        )
      );
    });

    it('logs out, clears SWR cache, and redirects even if logout API rejects', async () => {
      mockApiGet.mockResolvedValue({ isAuthenticated: false });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      );

      mockAuthService.logout.mockResolvedValueOnce(undefined);
      await act(async () => {
        fireEvent.click(screen.getByText('logout'));
      });
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));

      mockAuthService.logout.mockRejectedValueOnce(new Error('logout failed'));
      await act(async () => {
        fireEvent.click(screen.getByText('logout'));
      });

      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'));
      expect(mutate).toHaveBeenCalled();
      const [matcher] = (mutate as jest.Mock).mock.calls[0];
      expect(matcher()).toBe(true);

      // SWR mutate throws during logout still completes logout
      (mutate as jest.Mock).mockImplementationOnce(() => {
        throw new Error('swr clear error');
      });
      await act(async () => {
        fireEvent.click(screen.getByText('logout'));
      });
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });
});
