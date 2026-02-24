import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConfirmationModal } from './index';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('ConfirmationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Title',
    declaration: 'I agree to the terms',
    confirmButtonText: 'Confirm',
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('I agree to the terms')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('button is disabled initially', () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toBeDisabled();
  });

  it('enables button when checkbox is checked', async () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    
    await userEvent.click(checkbox);
    
    expect(checkbox).toBeChecked();
    expect(confirmButton).toBeEnabled();
  });

  it('calls onConfirm when button is clicked', async () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    
    await userEvent.click(checkbox);
    await userEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state properly', () => {
    render(<ConfirmationModal {...defaultProps} loading={true} />);
    
    const confirmButton = screen.getByRole('button', { name: 'Saving...' });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<ConfirmationModal {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i }); // Assuming img alt is "Close"
    await userEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
