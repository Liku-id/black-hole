import { render, screen, fireEvent } from '@testing-library/react';
import { UnverifiedModal } from './index';

describe('UnverifiedModal', () => {
  const mockOnClose = jest.fn();
  const mockOnProceed = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <UnverifiedModal
          open={true}
          onClose={mockOnClose}
          onProceed={mockOnProceed}
        />
      );

      expect(screen.getByText('Account Unverified')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <UnverifiedModal
          open={false}
          onClose={mockOnClose}
          onProceed={mockOnProceed}
        />
      );

      expect(screen.queryByText('Account Unverified')).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display unverified message', () => {
      render(
        <UnverifiedModal
          open={true}
          onClose={mockOnClose}
          onProceed={mockOnProceed}
        />
      );

      expect(
        screen.getByText(
          /This creator is unverified. Do you want to complete the verification step for this creator?/i
        )
      ).toBeInTheDocument();
    });
  });

  describe('Buttons', () => {
    it('should render Back and Proceed buttons', () => {
      render(
        <UnverifiedModal
          open={true}
          onClose={mockOnClose}
          onProceed={mockOnProceed}
        />
      );

      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(screen.getByText('Proceed')).toBeInTheDocument();
    });

    it('should call onClose when Back button is clicked', () => {
      render(
        <UnverifiedModal
          open={true}
          onClose={mockOnClose}
          onProceed={mockOnProceed}
        />
      );

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onProceed when Proceed button is clicked', () => {
      render(
        <UnverifiedModal
          open={true}
          onClose={mockOnClose}
          onProceed={mockOnProceed}
        />
      );

      const proceedButton = screen.getByText('Proceed');
      fireEvent.click(proceedButton);

      expect(mockOnProceed).toHaveBeenCalled();
    });
  });
});

