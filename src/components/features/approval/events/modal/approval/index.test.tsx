import { render, screen, fireEvent } from '@testing-library/react';
import { ApprovalModal } from './index';

describe('ApprovalModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <ApprovalModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Approve Event Submission')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <ApprovalModal
          open={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(
        screen.queryByText('Approve Event Submission')
      ).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display approval message with event name', () => {
      render(
        <ApprovalModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          eventName="Test Event"
        />
      );

      expect(
        screen.getByText(/Are you sure you want to approve the event "Test Event"/i)
      ).toBeInTheDocument();
    });

    it('should display default message when event name is not provided', () => {
      render(
        <ApprovalModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(
        screen.getByText(/Are you sure you want to approve the event "this event"/i)
      ).toBeInTheDocument();
    });
  });

  describe('Buttons', () => {
    it('should render No and Yes buttons', () => {
      render(
        <ApprovalModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('should call onClose when No button is clicked', () => {
      render(
        <ApprovalModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      const noButton = screen.getByText('No');
      fireEvent.click(noButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onConfirm when Yes button is clicked', () => {
      render(
        <ApprovalModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      const yesButton = screen.getByText('Yes');
      fireEvent.click(yesButton);

      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it('should disable buttons when loading is true', () => {
      render(
        <ApprovalModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          loading={true}
        />
      );

      const noButton = screen.getByText('No');
      const yesButton = screen.getByText('Yes');

      expect(noButton).toBeDisabled();
      expect(yesButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error is provided', () => {
      render(
        <ApprovalModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          error="Failed to approve"
        />
      );

      expect(screen.getByText('Failed to approve')).toBeInTheDocument();
    });
  });
});

