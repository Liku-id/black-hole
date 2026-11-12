import { fireEvent, render, screen } from '@testing-library/react';

import { PreviewEventModal } from './index';

describe('PreviewEventModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal content when open is true', () => {
    render(
      <PreviewEventModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Preview Event')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure want to preview this event in new tab?')
    ).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Yes, Preview')).toBeInTheDocument();
  });

  it('should not render modal content when open is false', () => {
    render(
      <PreviewEventModal
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('Preview Event')).not.toBeInTheDocument();
  });

  it('should call onClose when Back is clicked', () => {
    render(
      <PreviewEventModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('Back'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when Yes, Preview is clicked', () => {
    render(
      <PreviewEventModal
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('Yes, Preview'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});
