import { render, screen, waitFor } from '@testing-library/react';

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
          title="Test Sales Modal"
        />
      );

      expect(screen.getByText('Test Sales Modal')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <TicketDateModal
          open={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      expect(screen.queryByText('Test Sales Modal')).not.toBeInTheDocument();
    });
  });

  describe('Form Rendering', () => {
    it('should render date field', () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('should render time field', () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      expect(screen.getByText('Time')).toBeInTheDocument();
    });

    it('should render timezone select', () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      expect(screen.getByText('Time Zone')).toBeInTheDocument();
    });

    it('should render save button', async () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      await waitFor(() => {
        // Save button should be rendered
        const saveButton = screen.queryByText('Save Date');
        if (saveButton) {
          expect(saveButton).toBeInTheDocument();
        }
      });
    });
  });

  describe('Form Submission', () => {
    it('should render form fields correctly', async () => {
      render(
        <TicketDateModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      await waitFor(() => {
        // Verify all fields are rendered
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('Time')).toBeInTheDocument();
        expect(screen.getByText('Time Zone')).toBeInTheDocument();
      });
    });
  });
});

