import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';

// Context mock
const mockLogin = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
    clearError: jest.fn()
  })
}));

// Mock validation
jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  validationUtils: {
    ...jest.requireActual('@/utils').validationUtils,
    emailValidator: () => true
  }
}));

// Mock Next router
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('LoginForm', () => {
  it('renders correctly', () => {
    render(<LoginForm />);
    expect(screen.getByText('Welcome Back,')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
  });

  it('submits form', async () => {
    mockLogin.mockClear();
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
    
    const submitBtn = screen.getByText('Sign In');
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
       expect(mockLogin).toHaveBeenCalled();
    });
  });
});
