import { render, screen, fireEvent } from '@testing-library/react';

import { SubmitSection } from '../submit-section';

describe('SubmitSection', () => {
  const mockOnAddNewQuestion = jest.fn();
  const mockOnSubmitAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Add New Question button', () => {
      render(
        <SubmitSection
          isSubmitting={false}
          submitError={null}
          isSubmitDisabled={false}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      expect(screen.getByText('Add New Question')).toBeInTheDocument();
    });

    it('should render Submit button', () => {
      render(
        <SubmitSection
          isSubmitting={false}
          submitError={null}
          isSubmitDisabled={false}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should display error message when submitError is provided', () => {
      render(
        <SubmitSection
          isSubmitting={false}
          submitError="Test error message"
          isSubmitDisabled={false}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should not display error message when submitError is null', () => {
      render(
        <SubmitSection
          isSubmitting={false}
          submitError={null}
          isSubmitDisabled={false}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display "Submitting..." when isSubmitting is true', () => {
      render(
        <SubmitSection
          isSubmitting={true}
          submitError={null}
          isSubmitDisabled={true}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    it('should disable Add New Question button when isSubmitting is true', () => {
      render(
        <SubmitSection
          isSubmitting={true}
          submitError={null}
          isSubmitDisabled={true}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      const addButton = screen.getByText('Add New Question');
      expect(addButton).toBeDisabled();
    });
  });

  describe('Button Actions', () => {
    it('should call onAddNewQuestion when Add New Question button is clicked', () => {
      render(
        <SubmitSection
          isSubmitting={false}
          submitError={null}
          isSubmitDisabled={false}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      const addButton = screen.getByText('Add New Question');
      fireEvent.click(addButton);
      expect(mockOnAddNewQuestion).toHaveBeenCalled();
    });

    it('should call onSubmitAll when Submit button is clicked', () => {
      render(
        <SubmitSection
          isSubmitting={false}
          submitError={null}
          isSubmitDisabled={false}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);
      expect(mockOnSubmitAll).toHaveBeenCalled();
    });

    it('should disable Submit button when isSubmitDisabled is true', () => {
      render(
        <SubmitSection
          isSubmitting={false}
          submitError={null}
          isSubmitDisabled={true}
          onAddNewQuestion={mockOnAddNewQuestion}
          onSubmitAll={mockOnSubmitAll}
        />
      );

      const submitButton = screen.getByText('Submit');
      expect(submitButton).toBeDisabled();
    });
  });
});


