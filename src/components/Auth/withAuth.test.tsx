import React from 'react';
import { render, screen } from '@testing-library/react';
import { withAuth } from './withAuth';

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock Next router logic
const mockReplace = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    asPath: '/protected',
    pathname: '/protected'
  })
}));

import { useAuth } from '@/contexts/AuthContext';

describe('withAuth', () => {
  const MockComponent = () => <div>Protected Content</div>;
  const WrappedComponent = withAuth(MockComponent);
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    mockReplace.mockClear();
    mockUseAuth.mockClear();
  });

  it('redirects if not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
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
      user: null
    });

    render(<WrappedComponent />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument(); // CircularProgress has role progressbar
  });
});
