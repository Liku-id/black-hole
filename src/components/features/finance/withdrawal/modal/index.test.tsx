import { fireEvent, render, screen } from '@testing-library/react';

import { WithdrawalModal } from './index';

jest.mock('@/components/common', () => ({
  Body2: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Button: ({
    children,
    disabled,
    id,
    onClick
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    id?: string;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} id={id} type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Modal: ({
    children,
    footer,
    onClose,
    open,
    title
  }: {
    children: React.ReactNode;
    footer?: React.ReactNode;
    onClose?: () => void;
    open: boolean;
    title: string;
  }) =>
    open ? (
      <div data-testid="withdrawal-modal">
        <h2>{title}</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
  Overline: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}));

describe('WithdrawalModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not render when open is false', () => {
    render(<WithdrawalModal {...defaultProps} open={false} />);

    expect(screen.queryByTestId('withdrawal-modal')).not.toBeInTheDocument();
  });

  it('renders confirmation title, body, and action buttons when open', () => {
    render(<WithdrawalModal {...defaultProps} />);

    expect(screen.getByText('Withdrawal Confirmation')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to make a withdrawal?')
    ).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeEnabled();
    expect(screen.getByText('Yes, Withdraw')).toBeEnabled();
  });

  it('calls onClose when Back or Close button is clicked', () => {
    render(<WithdrawalModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Back'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Close'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it('calls onConfirm when Yes, Withdraw is clicked', () => {
    render(<WithdrawalModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Yes, Withdraw'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows Processing... when loading is true', () => {
    render(<WithdrawalModal {...defaultProps} loading={true} />);

    expect(screen.getByText('Back')).toBeDisabled();
    const confirmBtn = screen.getByText('Processing...');
    expect(confirmBtn).toBeDisabled();
  });

  it('displays error message when error is provided', () => {
    render(<WithdrawalModal {...defaultProps} error="Insufficient funds" />);

    expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
  });
});
