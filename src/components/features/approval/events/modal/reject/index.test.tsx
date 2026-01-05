import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { RejectModal } from './index';

describe('RejectModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Reject Event Submission')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <RejectModal
          open={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(
        screen.queryByText('Reject Event Submission')
      ).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display rejection message', () => {
      render(
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(
        screen.getByText(/Are you sure you want to reject this event submission/i)
      ).toBeInTheDocument();
    });

    it('should display rejected fields when provided', () => {
      render(
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          rejectedFields={['name', 'description', 'address']}
        />
      );

      expect(screen.getByText('Rejected fields:')).toBeInTheDocument();
      // Check for field labels (they might be in a single string)
      const rejectedFieldsText = screen.getByText(/Event Name|Event Description|Address/i);
      expect(rejectedFieldsText).toBeInTheDocument();
    });

    it('should not display rejected fields section when rejectedFields is empty', () => {
      render(
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          rejectedFields={[]}
        />
      );

      expect(screen.queryByText('Rejected fields:')).not.toBeInTheDocument();
    });

    it('should render rejection reason input field', () => {
      render(
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      expect(
        screen.getByPlaceholderText('Enter rejection reason')
      ).toBeInTheDocument();
    });
  });

  describe('Buttons', () => {
    it('should render No and Yes buttons', () => {
      render(
        <RejectModal
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
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      const noButton = screen.getByText('No');
      fireEvent.click(noButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onConfirm with reason when Yes button is clicked', async () => {
      render(
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      const reasonInput = screen.getByPlaceholderText('Enter rejection reason');
      fireEvent.change(reasonInput, { target: { value: 'Test rejection reason' } });

      const yesButton = screen.getByText('Yes');
      fireEvent.click(yesButton);

      expect(mockOnConfirm).toHaveBeenCalledWith('Test rejection reason');
    });

    it('should disable Yes button when reason is empty', () => {
      render(
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      const yesButton = screen.getByText('Yes');
      expect(yesButton).toBeDisabled();
    });

    it('should enable Yes button when reason is provided', async () => {
      render(
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      const reasonInput = screen.getByPlaceholderText('Enter rejection reason');
      fireEvent.change(reasonInput, { target: { value: 'Test reason' } });

      await waitFor(() => {
        const yesButton = screen.getByText('Yes');
        expect(yesButton).not.toBeDisabled();
      });
    });

    it('should disable buttons when loading is true', () => {
      render(
        <RejectModal
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
        <RejectModal
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          error="Failed to reject"
        />
      );

      expect(screen.getByText('Failed to reject')).toBeInTheDocument();
    });
  });
});

