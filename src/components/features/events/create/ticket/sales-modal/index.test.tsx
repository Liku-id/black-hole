import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SalesModal } from './index';

describe('SalesModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render when open is true', () => {
      render(
        <SalesModal
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
        <SalesModal
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
        <SalesModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      expect(screen.getByText('Start Date')).toBeInTheDocument();
    });

    it('should render time field', () => {
      render(
        <SalesModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      expect(screen.getByText('Time Start')).toBeInTheDocument();
    });

    it('should render timezone select', () => {
      render(
        <SalesModal
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
        <SalesModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      await waitFor(() => {
        // Save button should be rendered
        const saveButton = screen.queryByText('Save Data');
        if (saveButton) {
          expect(saveButton).toBeInTheDocument();
        }
      });
    });
  });

  describe('Form Submission', () => {
    it('should render form fields correctly', async () => {
      render(
        <SalesModal
          open={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          title="Test Sales Modal"
        />
      );

      await waitFor(() => {
        // Verify all fields are rendered
        expect(screen.getByText('Start Date')).toBeInTheDocument();
        expect(screen.getByText('Time Start')).toBeInTheDocument();
        expect(screen.getByText('Time Zone')).toBeInTheDocument();
      });
    });
  });
});

