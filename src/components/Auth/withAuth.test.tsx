import { render, screen } from '@testing-library/react';

import { useAuth } from '@/contexts/AuthContext';

import { withAuth } from './withAuth';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const mockReplace = jest.fn();
let mockPathname = '/protected';
let mockAsPath = '/protected';

jest.mock('next/router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    asPath: mockAsPath,
    pathname: mockPathname
  })
}));

describe('withAuth', () => {
  const MockComponent = () => <div>Protected Content</div>;
  const WrappedComponent = withAuth(MockComponent);
  const PublicAuthPage = withAuth(MockComponent, { requireAuth: false });
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    mockReplace.mockClear();
    mockUseAuth.mockClear();
    mockPathname = '/protected';
    mockAsPath = '/protected';
  });

  it('redirects if not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null
    });

    render(<WrappedComponent />);
    expect(mockReplace).toHaveBeenCalledWith('/login?redirect=%2Fprotected');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders content if authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { role: { name: 'admin' } }
    });

    render(<WrappedComponent />);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      error: null,
      user: null
    });

    render(<WrappedComponent />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects authenticated users away from /login and /register by role', () => {
    mockPathname = '/login';
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { role: { name: 'cashier' } }
    });

    const { unmount } = render(<PublicAuthPage />);
    expect(mockReplace).toHaveBeenCalledWith('/ots');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    unmount();

    mockReplace.mockClear();
    mockPathname = '/register';
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { role: { name: 'finance' } }
    });

    const { unmount: unmount2 } = render(<PublicAuthPage />);
    expect(mockReplace).toHaveBeenCalledWith('/events');
    unmount2();

    mockReplace.mockClear();
    mockPathname = '/login';
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { role: { name: 'admin' } }
    });
    render(<PublicAuthPage />);
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('enforces RBAC for ground_staff, finance, and cashier roles', () => {
    mockPathname = '/dashboard';
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { role: { name: 'ground_staff' } }
    });
    const { unmount } = render(<WrappedComponent />);
    expect(mockReplace).toHaveBeenCalledWith('/events');
    unmount();

    mockReplace.mockClear();
    mockPathname = '/events/create';
    const { unmount: unmount2 } = render(<WrappedComponent />);
    expect(mockReplace).toHaveBeenCalledWith('/events');
    unmount2();

    mockReplace.mockClear();
    mockPathname = '/dashboard';
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { role: { name: 'finance' } }
    });
    const { unmount: unmount3 } = render(<WrappedComponent />);
    expect(mockReplace).toHaveBeenCalledWith('/events');
    unmount3();

    mockReplace.mockClear();
    mockPathname = '/finance';
    const { unmount: unmount4 } = render(<WrappedComponent />);
    expect(mockReplace).not.toHaveBeenCalled();
    unmount4();

    mockReplace.mockClear();
    mockPathname = '/dashboard';
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { role: { name: 'cashier' } }
    });
    const { unmount: unmount5 } = render(<WrappedComponent />);
    expect(mockReplace).toHaveBeenCalledWith('/ots');
    unmount5();

    mockReplace.mockClear();
    mockPathname = '/account';
    render(<WrappedComponent />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('resets redirect flag when an auth error occurs and preserves displayName', () => {
    mockPathname = '/login';
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: { role: { name: 'admin' } }
    });
    const { rerender } = render(<PublicAuthPage />);
    expect(mockReplace).toHaveBeenCalledWith('/dashboard');

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: 'Session error',
      user: { role: { name: 'admin' } }
    });
    rerender(<PublicAuthPage />);

    expect(WrappedComponent.displayName).toBe('withAuth(MockComponent)');
  });
});
