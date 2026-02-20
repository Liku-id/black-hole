import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordForm from './index';

// Mocks
jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showError: jest.fn() })
}));

jest.mock('@/utils/validationUtils', () => ({
  validationUtils: {
    emailValidator: () => true
  }
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('ForgotPasswordForm', () => {
  it('renders correctly', () => {
    render(<ForgotPasswordForm onSubmit={async () => {}} />);
    expect(screen.getByText('Forgot Your Password,')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
  });

  it('submits form', async () => {
    const handleSubmit = jest.fn();
    render(<ForgotPasswordForm onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
    
    const submitBtn = screen.getByText('Send Link');
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });
});
