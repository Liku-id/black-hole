import { fireEvent, render, screen } from '@testing-library/react';

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
    { value: 'PARAGRAPH', label: 'Paragraph', icon: '/icon/paragraph.svg' },
    { value: 'DROPDOWN', label: 'Multiple Choice', icon: '/icon/radio.svg' }
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
      fireEvent.change(questionInput, { target: { value: 'Should not fire' } });
      expect(mockOnFieldChange).not.toHaveBeenCalled();
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

    it('should reflect isRequired state on checkbox', () => {
      const { rerender } = render(
        <ExistingQuestionForm
          form={{ ...mockForm, isRequired: undefined }}
          questionNumber={2}
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

      expect(screen.getByRole('checkbox')).not.toBeChecked();

      rerender(
        <ExistingQuestionForm
          form={{ ...mockForm, isRequired: true }}
          questionNumber={2}
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

      expect(screen.getByRole('checkbox')).toBeChecked();
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
      fireEvent.change(questionInput, {
        target: { value: 'Updated Question' }
      });

      expect(mockOnFieldChange).toHaveBeenCalledWith(
        'form1',
        'field',
        'Updated Question'
      );
    });

    it('should call onTypeChange when form type is changed', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={2}
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

      const selectInput = screen.getByDisplayValue('Short Question');
      fireEvent.click(selectInput);

      fireEvent.click(screen.getByText('Paragraph'));
      expect(mockOnTypeChange).toHaveBeenCalledWith('form1', 'PARAGRAPH');
    });

    it('should call onFieldChange when required checkbox is toggled', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={2}
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

      fireEvent.click(screen.getByRole('checkbox'));
      expect(mockOnFieldChange).toHaveBeenCalledWith(
        'form1',
        'isRequired',
        true
      );
    });

    it('should call onOptionChange and onAddOption with isExistingForm=true', () => {
      render(
        <ExistingQuestionForm
          form={{
            ...mockForm,
            type: 'DROPDOWN',
            options: ['Opt 1', 'Opt 2']
          }}
          questionNumber={2}
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

      fireEvent.change(screen.getByPlaceholderText('Option 1'), {
        target: { value: 'New Opt 1' }
      });
      expect(mockOnOptionChange).toHaveBeenCalledWith(
        'form1',
        0,
        'New Opt 1',
        true
      );

      fireEvent.click(screen.getByText('Add new option'));
      expect(mockOnAddOption).toHaveBeenCalledWith('form1', true);
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

      const deleteButton = screen.getByAltText('Delete').closest('button')!;
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('form1');
    });

    it('should call onDuplicate when duplicate button is clicked', () => {
      render(
        <ExistingQuestionForm
          form={mockForm}
          questionNumber={2}
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

      const duplicateButton = screen.getByAltText('Copy').closest('button')!;
      fireEvent.click(duplicateButton);
      expect(mockOnDuplicate).toHaveBeenCalledWith('form1');
    });
  });
});
