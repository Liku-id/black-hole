import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useAuth } from '@/contexts/AuthContext';

import LoginForm from './LoginForm';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  validationUtils: {
    ...jest.requireActual('@/utils').validationUtils,
    emailValidator: () => undefined
  }
}));

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush })
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError
    });
  });

  it('renders correctly and navigates to forgot-password and register', () => {
    render(<LoginForm />);
    expect(screen.getByText('Welcome Back,')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Forgot Password?'));
    expect(mockPush).toHaveBeenCalledWith('/forgot-password');

    fireEvent.click(screen.getByText('Sign up'));
    expect(mockPush).toHaveBeenCalledWith('/register');
  });

  it('toggles password visibility and displays auth error', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials',
      clearError: mockClearError
    });

    render(<LoginForm />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();

    const passwordInput = screen.getByPlaceholderText(
      'Password'
    ) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    fireEvent.click(screen.getByAltText('Toggle password visibility'));
    expect(passwordInput.type).toBe('text');
  });

  it('submits form and resets submitting state if login rejects', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));

    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass123' }
    });

    const submitBtn = screen.getByText('Sign In');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass123'
      });
    });

    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    errSpy.mockRestore();
  });
});
