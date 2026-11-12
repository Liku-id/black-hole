import { fireEvent, render, screen } from '@testing-library/react';

import OTSApprovalModal from './index';

jest.mock('@/components/common', () => ({
  Body2: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Button: ({
    children,
    disabled,
    onClick
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} type="button" onClick={onClick}>
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
      <div data-testid="ots-approval-modal">
        <h2>{title}</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null
}));

describe('OTSApprovalModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onApprove: jest.fn(),
    onReject: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not render when open is false', () => {
    render(<OTSApprovalModal {...defaultProps} open={false} />);

    expect(screen.queryByTestId('ots-approval-modal')).not.toBeInTheDocument();
  });

  it('renders eventName when provided', () => {
    render(<OTSApprovalModal {...defaultProps} eventName="Jazz Festival" />);

    expect(screen.getByText('Review OTS Request')).toBeInTheDocument();
    expect(screen.getByText('Jazz Festival')).toBeInTheDocument();
  });

  it('renders fallback text when eventName is omitted', () => {
    render(<OTSApprovalModal {...defaultProps} />);

    expect(screen.getByText('this event')).toBeInTheDocument();
  });

  it('triggers onApprove, onReject, and onClose callbacks', () => {
    render(<OTSApprovalModal {...defaultProps} eventName="Rock Fest" />);

    fireEvent.click(screen.getByText('Reject'));
    expect(defaultProps.onReject).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Yes, Approve'));
    expect(defaultProps.onApprove).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Close'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('disables Reject and Yes, Approve buttons when loading is true', () => {
    render(<OTSApprovalModal {...defaultProps} loading={true} />);

    expect(screen.getByText('Reject')).toBeDisabled();
    expect(screen.getByText('Yes, Approve')).toBeDisabled();
  });
});
