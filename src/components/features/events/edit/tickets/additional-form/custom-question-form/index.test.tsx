import { render, screen, fireEvent } from '@testing-library/react';

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
    });

    it('should render required question checkbox', () => {
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

      expect(screen.getByText('Required Question')).toBeInTheDocument();
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
      fireEvent.change(questionInput, { target: { value: 'Updated Question' } });

      expect(mockOnQuestionChange).toHaveBeenCalledWith('question1', {
        question: 'Updated Question'
      });
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

      const deleteButton = screen.getByAltText('Delete').closest('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledWith('question1');
      }
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

      const duplicateButton = screen.getByAltText('Copy').closest('button');
      if (duplicateButton) {
        fireEvent.click(duplicateButton);
        expect(mockOnDuplicate).toHaveBeenCalledWith('question1');
      }
    });
  });
});


