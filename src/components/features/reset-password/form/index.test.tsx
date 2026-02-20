import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordForm from './index';

// Mocks
jest.mock('@/utils/validationUtils', () => ({
  validationUtils: {
    passwordValidator: () => true, // Always valid
    confirmPasswordValidator: () => true // Always valid
  }
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

describe('ResetPasswordForm', () => {
  it('renders correctly', () => {
    render(<ResetPasswordForm onSubmit={async () => {}} />);
    expect(screen.getByText('Welcome Back,')).toBeInTheDocument();
    expect(screen.getByText('New Password')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<ResetPasswordForm onSubmit={async () => {}} />);
    const inputs = screen.getAllByPlaceholderText(/8-20 characters/i);
    const passwordInput = inputs[0] as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
    
    // Toggle visibility
    const toggleBtns = screen.getAllByAltText('Toggle password visibility');
    fireEvent.click(toggleBtns[0]);
    expect(passwordInput.type).toBe('text');
  });

  it('submits form', async () => {
    const handleSubmit = jest.fn();
    render(<ResetPasswordForm onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getAllByPlaceholderText(/8-20 characters/i)[0], { target: { value: 'password123' } });
    fireEvent.change(screen.getAllByPlaceholderText('Confirm Password')[0], { target: { value: 'password123' } });
    
    const submitBtn = screen.getByText('Reset Password');
    await waitFor(() => expect(submitBtn).not.toBeDisabled());
    
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
