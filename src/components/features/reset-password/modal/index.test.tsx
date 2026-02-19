import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResetPasswordModal from './index';

describe('ResetPasswordModal', () => {
  it('renders correctly', () => {
    render(
      <ResetPasswordModal
        open={true}
        onLogin={() => {}}
      />
    );
    expect(screen.getByText('Reset Password Complete!')).toBeInTheDocument();
  });

  it('calls onLogin', () => {
    const handleLogin = jest.fn();
    render(
      <ResetPasswordModal
        open={true}
        onLogin={handleLogin}
      />
    );
    fireEvent.click(screen.getByText('Login'));
    expect(handleLogin).toHaveBeenCalled();
  });
});
