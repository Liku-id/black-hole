import { render, screen, fireEvent } from '@testing-library/react';

import { ExistingQuestionForm } from '../existing-question-form';

describe('ExistingQuestionForm', () => {
  const mockForm = {
    id: 'form1',
    field: 'Existing Question',
    type: 'TEXT' as const,
    isRequired: false
  };

  const mockFormTypeOptions = [
    { value: 'TEXT', label: 'Short Question', icon: '/icon/text.svg' },
    { value: 'PARAGRAPH', label: 'Paragraph', icon: '/icon/paragraph.svg' }
  ];

  const mockOnFieldChange = jest.fn();
  const mockOnTypeChange = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnDuplicate = jest.fn();
  const mockOnOptionChange = jest.fn();
  const mockOnAddOption = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render question number', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={1}
          isFirstForm={false}
          formTypeOptions={mockFormTypeOptions}
          onFieldChange={mockOnFieldChange}
          onTypeChange={mockOnTypeChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    it('should render question field', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={1}
          isFirstForm={false}
          formTypeOptions={mockFormTypeOptions}
          onFieldChange={mockOnFieldChange}
          onTypeChange={mockOnTypeChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      expect(screen.getByText('Question*')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Question')).toBeInTheDocument();
    });

    it('should disable question field when isFirstForm is true', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={1}
          isFirstForm={true}
          formTypeOptions={mockFormTypeOptions}
          onFieldChange={mockOnFieldChange}
          onTypeChange={mockOnTypeChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const questionInput = screen.getByDisplayValue('Existing Question');
      expect(questionInput).toBeDisabled();
    });

    it('should not render form type select when isFirstForm is true', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={1}
          isFirstForm={true}
          formTypeOptions={mockFormTypeOptions}
          onFieldChange={mockOnFieldChange}
          onTypeChange={mockOnTypeChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      expect(screen.queryByText('Form Type')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onFieldChange when question text changes', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={1}
          isFirstForm={false}
          formTypeOptions={mockFormTypeOptions}
          onFieldChange={mockOnFieldChange}
          onTypeChange={mockOnTypeChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const questionInput = screen.getByDisplayValue('Existing Question');
      fireEvent.change(questionInput, { target: { value: 'Updated Question' } });

      expect(mockOnFieldChange).toHaveBeenCalledWith('form1', 'field', 'Updated Question');
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={1}
          isFirstForm={false}
          formTypeOptions={mockFormTypeOptions}
          onFieldChange={mockOnFieldChange}
          onTypeChange={mockOnTypeChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const deleteButton = screen.getByAltText('Delete').closest('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledWith('form1');
      }
    });
  });
});


