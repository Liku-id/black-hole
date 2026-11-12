import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { ActivateModal } from './modal';

describe('ActivateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnActivate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal content and action buttons when open', () => {
    renderWithProviders(
      <ActivateModal
        open={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    );

    expect(screen.getByText('Active OTS')).toBeInTheDocument();
    expect(
      screen.getByText('Do you want to activate OTS (On The Spot) feature?')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Yes, Activate' })).toBeEnabled();
  });

  it('does not render modal content when closed', () => {
    renderWithProviders(
      <ActivateModal
        open={false}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    );

    expect(screen.queryByText('Active OTS')).not.toBeInTheDocument();
  });

  it('calls onClose when Back is clicked and onActivate when Yes, Activate is clicked', () => {
    renderWithProviders(
      <ActivateModal
        open={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Yes, Activate' }));
    expect(mockOnActivate).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading is true', () => {
    renderWithProviders(
      <ActivateModal
        open={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
        loading={true}
      />
    );

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Yes, Activate' })
    ).toBeDisabled();
  });
});
