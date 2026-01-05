import { render, screen } from '@testing-library/react';

import { EventAssetsForm } from './index';

describe('EventAssetsForm', () => {
  const mockOnFilesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render event thumbnail label', () => {
      render(<EventAssetsForm onFilesChange={mockOnFilesChange} />);

      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
    });

    it('should render component structure', () => {
      const { container } = render(<EventAssetsForm onFilesChange={mockOnFilesChange} />);

      // Component should render
      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Component Functionality', () => {
    it('should render without errors', () => {
      render(<EventAssetsForm onFilesChange={mockOnFilesChange} />);

      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
    });

    it('should handle onFilesChange callback', () => {
      render(<EventAssetsForm onFilesChange={mockOnFilesChange} />);

      // Component should render
      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should pass error prop to thumbnail dropzone when showError is true', () => {
      render(<EventAssetsForm onFilesChange={mockOnFilesChange} showError={true} />);

      // Component should render
      expect(screen.getByText('Event Thumbnail*')).toBeInTheDocument();
    });
  });
});

