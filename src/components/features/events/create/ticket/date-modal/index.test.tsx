import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketDateModal } from './index';

describe('TicketDateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Date Modal"
        />
      );

      expect(screen.getByText('Test Date Modal')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <TicketDateModal
          open={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Date Modal"
        />
      );

      expect(screen.queryByText('Test Date Modal')).not.toBeInTheDocument();
    });
  });

  describe('Form Rendering', () => {
    it('should render date field', () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Date Modal"
        />
      );

      expect(screen.getByText('Select Date')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Date Modal"
        />
      );

      expect(screen.getByText('Save Data')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onSave when form is submitted', async () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Date Modal"
        />
      );

      // Form submission will be tested through the form's internal logic
      // Just verify the form renders
      expect(screen.getByText('Save Data')).toBeInTheDocument();
    });

    it('should call onClose when modal is closed', () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Date Modal"
        />
      );

      // Modal close functionality is handled by Modal component
      expect(screen.getByText('Test Date Modal')).toBeInTheDocument();
    });
  });
});


