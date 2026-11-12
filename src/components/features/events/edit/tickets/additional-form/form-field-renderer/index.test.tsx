import { fireEvent, render, screen } from '@testing-library/react';

import { FormFieldRenderer } from '../form-field-renderer';

describe('FormFieldRenderer', () => {
  const mockOnOptionChange = jest.fn();
  const mockOnAddOption = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Type Rendering', () => {
    it('should render TEXT field type', () => {
      render(<FormFieldRenderer formType="TEXT" isDisabled={false} />);

      expect(screen.getByText('Short Answer Text')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Example: Full Name')).toBeDisabled();
    });

    it('should render PARAGRAPH field type', () => {
      render(<FormFieldRenderer formType="PARAGRAPH" isDisabled={false} />);

      expect(screen.getByText('Paragraph Answer')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Example: Please provide your dietary restrictions or special requirements for the event.'
        )
      ).toBeDisabled();
    });

    it('should render NUMBER field type', () => {
      render(<FormFieldRenderer formType="NUMBER" isDisabled={false} />);

      expect(screen.getByText('Number Answer')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Example: 25')).toBeDisabled();
    });

    it('should render DATE field type', () => {
      render(<FormFieldRenderer formType="DATE" isDisabled={false} />);

      expect(screen.getByText('Date Answer')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Day/Month/Year')).toBeDisabled();
      expect(screen.getByAltText('calendar')).toBeInTheDocument();
    });

    it('should render DROPDOWN field type with options', () => {
      render(
        <FormFieldRenderer
          formType="DROPDOWN"
          options={['Option 1', 'Option 2']}
          isDisabled={false}
          questionId="question1"
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Option 2')).toBeInTheDocument();
      expect(screen.getAllByAltText('radio')).toHaveLength(2);
    });

    it('should render CHECKBOX field type with options', () => {
      render(
        <FormFieldRenderer
          formType="CHECKBOX"
          options={['Option 1', 'Option 2']}
          isDisabled={false}
          questionId="question1"
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Option 2')).toBeInTheDocument();
      expect(screen.getAllByAltText('checkbox')).toHaveLength(2);
    });

    it('should render empty container when options prop is omitted for DROPDOWN', () => {
      render(<FormFieldRenderer formType="DROPDOWN" isDisabled={false} />);

      expect(screen.queryByPlaceholderText(/Option/)).not.toBeInTheDocument();
    });

    it('should return null for unsupported formType', () => {
      const { container } = render(
        <FormFieldRenderer formType={'UNKNOWN' as any} isDisabled={false} />
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Options Handling', () => {
    it('should call onOptionChange when option value changes with default isExistingForm', () => {
      render(
        <FormFieldRenderer
          formType="DROPDOWN"
          options={['Option 1', 'Option 2']}
          isDisabled={false}
          questionId="question1"
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const optionInput = screen.getByPlaceholderText('Option 1');
      fireEvent.change(optionInput, { target: { value: 'Updated Option' } });

      expect(mockOnOptionChange).toHaveBeenCalledWith(
        'question1',
        0,
        'Updated Option',
        false
      );
    });

    it('should pass isExistingForm=true when specified', () => {
      render(
        <FormFieldRenderer
          formType="CHECKBOX"
          options={['Option 1']}
          isDisabled={false}
          questionId="form1"
          isExistingForm={true}
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const optionInput = screen.getByPlaceholderText('Option 1');
      fireEvent.change(optionInput, { target: { value: 'Updated Existing' } });
      expect(mockOnOptionChange).toHaveBeenCalledWith(
        'form1',
        0,
        'Updated Existing',
        true
      );

      fireEvent.click(screen.getByText('Add new option'));
      expect(mockOnAddOption).toHaveBeenCalledWith('form1', true);
    });

    it('should call onAddOption when Add new option button is clicked', () => {
      render(
        <FormFieldRenderer
          formType="DROPDOWN"
          options={['Option 1']}
          isDisabled={false}
          questionId="question1"
          onOptionChange={mockOnOptionChange}
          onAddOption={mockOnAddOption}
        />
      );

      const addButton = screen.getByText('Add new option');
      fireEvent.click(addButton);

      expect(mockOnAddOption).toHaveBeenCalledWith('question1', false);
    });

    it('should not show Add new option button when isDisabled is true', () => {
      render(
        <FormFieldRenderer
          formType="DROPDOWN"
          options={['Option 1']}
          isDisabled={true}
          questionId="question1"
        />
      );

      expect(screen.queryByText('Add new option')).not.toBeInTheDocument();
    });

    it('should not show Add new option button when questionId or onAddOption is missing', () => {
      render(
        <FormFieldRenderer
          formType="DROPDOWN"
          options={['Option 1']}
          isDisabled={false}
        />
      );

      expect(screen.queryByText('Add new option')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable fields when isDisabled is true for DROPDOWN', () => {
      render(
        <FormFieldRenderer
          formType="DROPDOWN"
          options={['Option 1']}
          isDisabled={true}
          questionId="question1"
        />
      );

      const optionInput = screen.getByPlaceholderText('Option 1');
      expect(optionInput).toBeDisabled();
    });

    it('should disable fields when isDisabled is true for CHECKBOX', () => {
      render(
        <FormFieldRenderer
          formType="CHECKBOX"
          options={['Option 1']}
          isDisabled={true}
          questionId="question1"
        />
      );

      const optionInput = screen.getByPlaceholderText('Option 1');
      expect(optionInput).toBeDisabled();
    });
  });
});
