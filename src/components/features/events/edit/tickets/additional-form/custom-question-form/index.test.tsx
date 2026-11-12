import { fireEvent, render, screen } from '@testing-library/react';

import { CustomQuestionForm } from '../custom-question-form';

describe('CustomQuestionForm', () => {
  const mockQuestion = {
    id: 'question1',
    question: 'Test Question',
    formType: 'TEXT' as const,
    isRequired: false
  };

  const mockFormTypeOptions = [
    { value: 'TEXT', label: 'Short Question', icon: '/icon/text.svg' },
    { value: 'PARAGRAPH', label: 'Paragraph', icon: '/icon/paragraph.svg' },
    { value: 'DROPDOWN', label: 'Multiple Choice', icon: '/icon/radio.svg' }
  ];

  const mockOnQuestionChange = jest.fn();
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
        <CustomQuestionForm
          question={mockQuestion}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
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
        <CustomQuestionForm
          question={mockQuestion}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      expect(screen.getByText('Question*')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Question')).toBeInTheDocument();
    });

    it('should render form type select', () => {
      render(
        <CustomQuestionForm
          question={mockQuestion}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      expect(screen.getByText('Form Type')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Short Question')).toBeInTheDocument();
    });

    it('should render required question checkbox with checked and unchecked states', () => {
      const { rerender } = render(
        <CustomQuestionForm
          question={{ ...mockQuestion, isRequired: undefined }}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      expect(screen.getByText('Required Question')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).not.toBeChecked();

      rerender(
        <CustomQuestionForm
          question={{ ...mockQuestion, isRequired: true }}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
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
    it('should call onQuestionChange when question text changes', () => {
      render(
        <CustomQuestionForm
          question={mockQuestion}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const questionInput = screen.getByDisplayValue('Test Question');
      fireEvent.change(questionInput, {
        target: { value: 'Updated Question' }
      });

      expect(mockOnQuestionChange).toHaveBeenCalledWith('question1', {
        question: 'Updated Question'
      });
    });

    it('should call onQuestionChange when form type changes', () => {
      render(
        <CustomQuestionForm
          question={mockQuestion}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const selectInput = screen.getByDisplayValue('Short Question');
      fireEvent.click(selectInput);

      const paragraphOption = screen.getByText('Paragraph');
      fireEvent.click(paragraphOption);

      expect(mockOnQuestionChange).toHaveBeenCalledWith('question1', {
        formType: 'PARAGRAPH'
      });
    });

    it('should call onQuestionChange when required checkbox is toggled', () => {
      render(
        <CustomQuestionForm
          question={mockQuestion}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnQuestionChange).toHaveBeenCalledWith('question1', {
        isRequired: true
      });
    });

    it('should call onOptionChange and onAddOption for DROPDOWN question', () => {
      render(
        <CustomQuestionForm
          question={{
            ...mockQuestion,
            formType: 'DROPDOWN',
            options: ['Option A', 'Option B']
          }}
          questionNumber={2}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const optionInput = screen.getByPlaceholderText('Option 1');
      fireEvent.change(optionInput, { target: { value: 'Option X' } });
      expect(mockOnOptionChange).toHaveBeenCalledWith(
        'question1',
        0,
        'Option X'
      );

      fireEvent.click(screen.getByText('Add new option'));
      expect(mockOnAddOption).toHaveBeenCalledWith('question1');
    });

    it('should call onDelete when delete button is clicked', () => {
      render(
        <CustomQuestionForm
          question={mockQuestion}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const deleteButton = screen.getByAltText('Delete').closest('button')!;
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('question1');
    });

    it('should call onDuplicate when duplicate button is clicked', () => {
      render(
        <CustomQuestionForm
          question={mockQuestion}
          questionNumber={1}
          formTypeOptions={mockFormTypeOptions}
          onQuestionChange={mockOnQuestionChange}
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const duplicateButton = screen.getByAltText('Copy').closest('button')!;
      fireEvent.click(duplicateButton);
      expect(mockOnDuplicate).toHaveBeenCalledWith('question1');
    });
  });
});
