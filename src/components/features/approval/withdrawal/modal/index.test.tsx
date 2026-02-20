import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WithdrawalActionModal from './index';

// Mock common components
jest.mock('@/components/common', () => ({
  Modal: ({ children, footer, title }: any) => (
    <div>
      <div>{title}</div>
      {children}
      <div>{footer}</div>
    </div>
  ),
  TextField: ({ value, onChange, label }: any) => (
    <input 
      aria-label={label}
      value={value}
      onChange={onChange}
    />
  ),
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Overline: ({ children }: any) => <div>{children}</div>
}));

describe('WithdrawalActionModal', () => {
  it('renders correctly', () => {
    render(
      <WithdrawalActionModal
        open={true}
        onClose={() => {}}
        onAction={() => {}}
      />
    );
    expect(screen.getByText('Withdrawal Action')).toBeInTheDocument();
  });

  it('validates reject action', () => {
    const handleAction = jest.fn();
    render(
      <WithdrawalActionModal
        open={true}
        onClose={() => {}}
        onAction={handleAction}
      />
    );
    
    const rejectBtn = screen.getByText('Reject').closest('button');
    expect(rejectBtn).toBeDisabled();
    
    const input = screen.getByLabelText('Rejection Reason');
    fireEvent.change(input, { target: { value: 'Reason' } });
    
    expect(rejectBtn).not.toBeDisabled();
    
    if(rejectBtn) fireEvent.click(rejectBtn);
    expect(handleAction).toHaveBeenCalledWith({
        action: 'reject',
        rejectionReason: 'Reason'
    });
  });

  it('validates approve action', () => {
    const handleAction = jest.fn();
    render(
      <WithdrawalActionModal
        open={true}
        onClose={() => {}}
        onAction={handleAction}
      />
    );
    
    const approveBtn = screen.getByText('Approve').closest('button');
    expect(approveBtn).not.toBeDisabled();
    if(approveBtn) fireEvent.click(approveBtn);
    expect(handleAction).toHaveBeenCalledWith({
        action: 'approve',
        rejectionReason: undefined
    });

    // If reason is typed, approve should be disabled
    const input = screen.getByLabelText('Rejection Reason');
    fireEvent.change(input, { target: { value: 'Reason' } });
    expect(approveBtn).toBeDisabled();
  });
});
