import { render, screen, fireEvent } from '@testing-library/react';
import { SuccessUpdateModal } from './index';

describe('SuccessUpdateModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true and eventStatus is on_review', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="on_review"
        />
      );

      expect(screen.getByText('Event is Being Reviewed')).toBeInTheDocument();
    });

    it('should render when open is true and eventStatus is on_going', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="on_going"
        />
      );

      expect(screen.getByText('Update Request Submitted')).toBeInTheDocument();
    });

    it('should render when open is true and eventStatus is approved', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="approved"
        />
      );

      expect(screen.getByText('Update Request Submitted')).toBeInTheDocument();
    });

    it('should not render when eventStatus is not valid', () => {
      const { container } = render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="draft"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when open is false', () => {
      render(
        <SuccessUpdateModal
          open={false}
          onClose={mockOnClose}
          eventStatus="on_review"
        />
      );

      expect(screen.queryByText('Event is Being Reviewed')).not.toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should display correct title for on_review status', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="on_review"
        />
      );

      expect(screen.getByText('Event is Being Reviewed')).toBeInTheDocument();
    });

    it('should display correct title for on_going status', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="on_going"
        />
      );

      expect(screen.getByText('Update Request Submitted')).toBeInTheDocument();
    });

    it('should display correct message for on_review status', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="on_review"
        />
      );

      expect(
        screen.getByText(/The changes to your event are currently on review/i)
      ).toBeInTheDocument();
    });

    it('should display correct message for on_going status', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="on_going"
        />
      );

      expect(
        screen.getByText(/Your event update request has been submitted/i)
      ).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="on_review"
        />
      );

      const closeButton = screen.getByAltText('Close').closest('button');
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when Back button is clicked', () => {
      render(
        <SuccessUpdateModal
          open={true}
          onClose={mockOnClose}
          eventStatus="on_review"
        />
      );

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});


