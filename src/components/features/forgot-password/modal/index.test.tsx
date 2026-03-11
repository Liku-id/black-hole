import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import ForgotPasswordModal from './index';

describe('ForgotPasswordModal', () => {
  it('renders correctly', () => {
    render(
      <ForgotPasswordModal
        open={true}
        email="test@example.com"
        onClose={() => {}}
        onResend={async () => {}}
        isResending={false}
      />
    );
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
  });

  it('calls onResend', () => {
    const handleResend = jest.fn();
    render(
      <ForgotPasswordModal
        open={true}
        email="test@example.com"
        onClose={() => {}}
        onResend={handleResend}
        isResending={false}
      />
    );
    fireEvent.click(screen.getByText('Resend Link'));
    expect(handleResend).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    render(
      <ForgotPasswordModal
        open={true}
        email="test@example.com"
        onClose={() => {}}
        onResend={async () => {}}
        isResending={true}
      />
    );
    expect(screen.getByText('Resending...')).toBeInTheDocument();
  });
});
