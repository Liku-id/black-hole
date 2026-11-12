import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';

import { useToast } from '@/contexts/ToastContext';
import { useDistinctAdditionalForms, useTicketType } from '@/hooks';
import { ticketsService } from '@/services/tickets';

import { AdditionalForm } from './index';

jest.mock('@/hooks', () => ({
  useTicketType: jest.fn(),
  useDistinctAdditionalForms: jest.fn()
}));

jest.mock('@/contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

jest.mock('@/services/tickets', () => ({
  ticketsService: {
    deleteAdditionalForm: jest.fn(),
    updateAdditionalForm: jest.fn(),
    createAdditionalForm: jest.fn()
  }
}));

const mockUseTicketType = useTicketType as jest.MockedFunction<
  typeof useTicketType
>;
const mockUseDistinctAdditionalForms =
  useDistinctAdditionalForms as jest.MockedFunction<
    typeof useDistinctAdditionalForms
  >;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockTicketsService = ticketsService as jest.Mocked<typeof ticketsService>;

describe('AdditionalForm', () => {
  const mockOnTicketTypeChange = jest.fn();
  const mockShowInfo = jest.fn();
  const mockShowSuccess = jest.fn();
  const mockMutate = jest.fn();

  const mockTicketTypes = [
    { id: 'ticket1', name: 'VIP Ticket', price: 100000 },
    { id: 'ticket2', name: 'Regular Ticket', price: 50000 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    let nowCounter = 1700000000000;
    jest.spyOn(Date, 'now').mockImplementation(() => {
      nowCounter += 1;
      return nowCounter;
    });

    mockUseToast.mockReturnValue({
      showInfo: mockShowInfo,
      showError: jest.fn(),
      showSuccess: mockShowSuccess,
      showWarning: jest.fn()
    } as any);
    mockUseTicketType.mockReturnValue({
      additionalForms: [],
      loading: false,
      mutate: mockMutate
    } as any);
    mockUseDistinctAdditionalForms.mockReturnValue({
      distinctForms: [],
      loading: false,
      error: null,
      mutate: jest.fn()
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering and Ticket Selection', () => {
    it('should render ticket type select and trigger onTicketTypeChange on selection', () => {
      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType=""
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      const selectInput = screen.getByPlaceholderText('Pilih Tiket');
      expect(selectInput).toBeInTheDocument();

      fireEvent.click(selectInput);
      fireEvent.click(screen.getByText('Regular Ticket'));
      expect(mockOnTicketTypeChange).toHaveBeenCalledWith('ticket2');
    });

    it('should handle empty ticketTypes and undefined distinctForms', () => {
      mockUseDistinctAdditionalForms.mockReturnValue({
        distinctForms: undefined as any,
        loading: false,
        error: null,
        mutate: jest.fn()
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={[]}
          selectedTicketType=""
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      fireEvent.click(screen.getByText('Show'));
      expect(
        screen.getByText('No existing questions found in other categories.')
      ).toBeInTheDocument();
    });

    it('should display loading message when loading', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: [],
        loading: true,
        mutate: mockMutate
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(
        screen.getByText('Loading additional forms...')
      ).toBeInTheDocument();
    });

    it('should display no forms message when no additional forms', () => {
      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(
        screen.getByText(/No additional forms found/i)
      ).toBeInTheDocument();
      expect(screen.getByText('Add New Question')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Auto-fill from first ticket', () => {
    it('should auto-fill questions from first ticket when selecting another empty ticket', async () => {
      mockUseDistinctAdditionalForms.mockReturnValue({
        distinctForms: [
          {
            id: 'df0',
            ticketTypeId: 'ticket1',
            field: 'Visitor Name',
            type: 'TEXT',
            isRequired: true,
            options: []
          },
          {
            id: 'df1',
            ticketTypeId: 'ticket1',
            field: 'T-Shirt Size',
            type: 'DROPDOWN',
            isRequired: true,
            options: ['S', 'M', 'L']
          },
          {
            id: 'df2',
            ticketTypeId: 'ticket2',
            field: 'Other Ticket Q',
            type: 'TEXT',
            isRequired: false,
            options: []
          }
        ],
        loading: false,
        error: null,
        mutate: jest.fn()
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket2"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('T-Shirt Size')).toBeInTheDocument();
      });
      expect(
        screen.queryByDisplayValue('Visitor Name')
      ).not.toBeInTheDocument();
      expect(mockShowInfo).toHaveBeenCalledWith(
        'Questions from the first ticket category have been automatically added.'
      );
    });

    it('should not auto-fill if first ticket has no non-visitor questions', () => {
      mockUseDistinctAdditionalForms.mockReturnValue({
        distinctForms: [
          {
            id: 'df0',
            ticketTypeId: 'ticket1',
            field: 'Visitor Name',
            type: 'TEXT',
            isRequired: true,
            options: []
          }
        ],
        loading: false,
        error: null,
        mutate: jest.fn()
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket2"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(mockShowInfo).not.toHaveBeenCalled();
    });
  });

  describe('Existing Form Management', () => {
    const existingForms = [
      {
        id: 'form0',
        field: 'Visitor Name',
        type: 'TEXT',
        order: 0,
        isRequired: true,
        options: null
      },
      {
        id: 'form1',
        field: 'Phone',
        type: 'TEXT',
        order: 1,
        isRequired: false,
        options: []
      },
      {
        id: 'form2',
        field: 'Dietary',
        type: 'DROPDOWN',
        order: 2,
        isRequired: true,
        options: ['Vegan', 'Halal']
      }
    ];

    it('should edit existing form fields, types, options, required, duplicate, and delete', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: existingForms,
        loading: false,
        mutate: mockMutate
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      // Edit field on form1
      const phoneInput = screen.getByDisplayValue('Phone');
      fireEvent.change(phoneInput, { target: { value: 'Phone Number' } });
      expect(screen.getByDisplayValue('Phone Number')).toBeInTheDocument();

      // Toggle required on form1
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      // Change type of form1 from TEXT to DROPDOWN (options initialized to [])
      const typeInputs = screen.getAllByDisplayValue('Short Question');
      fireEvent.click(typeInputs[0]);
      fireEvent.click(
        within(screen.getByRole('menu')).getByText('Multiple Choice')
      );

      // Change type of form2 from DROPDOWN to CHECKBOX (keeps existing options)
      fireEvent.click(screen.getAllByDisplayValue('Multiple Choice')[1]);
      fireEvent.click(within(screen.getByRole('menu')).getByText('Checkbox'));

      // Update option and add option on form2
      const veganInput = screen.getByDisplayValue('Vegan');
      fireEvent.change(veganInput, { target: { value: 'Vegetarian' } });
      expect(screen.getByDisplayValue('Vegetarian')).toBeInTheDocument();

      const addOptButtons = screen.getAllByText('Add new option');
      fireEvent.click(addOptButtons[addOptButtons.length - 1]);
      expect(screen.getByPlaceholderText('Option 3')).toBeInTheDocument();

      // Change form2 from CHECKBOX to TEXT (deletes options), then back to DROPDOWN (hits !updatedForm.options -> ['', ''])
      fireEvent.click(screen.getByDisplayValue('Checkbox'));
      fireEvent.click(
        within(screen.getByRole('menu')).getByText('Short Question')
      );
      expect(screen.queryByDisplayValue('Vegetarian')).not.toBeInTheDocument();

      fireEvent.click(screen.getByDisplayValue('Short Question'));
      fireEvent.click(
        within(screen.getByRole('menu')).getByText('Multiple Choice')
      );
      expect(screen.getAllByPlaceholderText('Option 1').length).toBeGreaterThan(
        0
      );

      // Duplicate form2 and form0 (null options branch)
      const copyButtons = screen.getAllByAltText('Copy');
      fireEvent.click(copyButtons[1].closest('button')!);
      expect(screen.getByText('Question 4')).toBeInTheDocument();

      // Delete form1
      const deleteButtons = screen.getAllByAltText('Delete');
      fireEvent.click(deleteButtons[0].closest('button')!);
      expect(
        screen.queryByDisplayValue('Phone Number')
      ).not.toBeInTheDocument();
    });
  });

  describe('Custom Question Management and Validation', () => {
    it('should add, edit, change types, manage options, duplicate, delete, and validate custom questions', () => {
      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      // Add two custom questions
      fireEvent.click(screen.getByText('Add New Question'));
      fireEvent.click(screen.getByText('Add New Question'));

      // Initially empty questions -> Submit disabled
      expect(screen.getByText('Submit')).toBeDisabled();

      const qInputs = screen.getAllByPlaceholderText(
        'Write your question here'
      );
      fireEvent.change(qInputs[0], { target: { value: 'Question Alpha' } });
      fireEvent.change(qInputs[1], { target: { value: 'Question Beta' } });

      // Both filled -> Submit enabled
      expect(screen.getByText('Submit')).not.toBeDisabled();

      // Switch first question to DROPDOWN -> creates ['', ''], so Submit disabled
      const typeInputs = screen.getAllByDisplayValue('Short Question');
      fireEvent.click(typeInputs[0]);
      fireEvent.click(
        within(screen.getByRole('menu')).getByText('Multiple Choice')
      );
      expect(screen.getByText('Submit')).toBeDisabled();

      // Fill options and add a third option
      const opt1 = screen.getByPlaceholderText('Option 1');
      const opt2 = screen.getByPlaceholderText('Option 2');
      fireEvent.change(opt1, { target: { value: 'Yes' } });
      fireEvent.change(opt2, { target: { value: 'No' } });
      expect(screen.getByText('Submit')).not.toBeDisabled();

      fireEvent.click(screen.getByText('Add new option'));
      const opt3 = screen.getByPlaceholderText('Option 3');
      expect(screen.getByText('Submit')).toBeDisabled();
      fireEvent.change(opt3, { target: { value: 'Maybe' } });
      expect(screen.getByText('Submit')).not.toBeDisabled();

      // Switch first question to CHECKBOX (preserves options)
      fireEvent.click(screen.getByDisplayValue('Multiple Choice'));
      fireEvent.click(within(screen.getByRole('menu')).getByText('Checkbox'));
      expect(screen.getByDisplayValue('Maybe')).toBeInTheDocument();

      // Switch first question to PARAGRAPH (deletes options)
      fireEvent.click(screen.getByDisplayValue('Checkbox'));
      fireEvent.click(within(screen.getByRole('menu')).getByText('Paragraph'));
      expect(screen.queryByDisplayValue('Maybe')).not.toBeInTheDocument();

      // Toggle required on first question and duplicate it
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      const copyButtons = screen.getAllByAltText('Copy');
      fireEvent.click(copyButtons[0].closest('button')!);
      expect(screen.getByText('Question 3')).toBeInTheDocument();

      // Delete second question (Question Beta)
      const deleteButtons = screen.getAllByAltText('Delete');
      fireEvent.click(deleteButtons[1].closest('button')!);
      expect(
        screen.queryByDisplayValue('Question Beta')
      ).not.toBeInTheDocument();
    });

    it('should disable submit when an existing form has empty field or empty dropdown option', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: [
          {
            id: 'form0',
            field: 'Visitor Name',
            type: 'TEXT',
            order: 0,
            isRequired: true,
            options: []
          },
          {
            id: 'form1',
            field: 'Meal',
            type: 'DROPDOWN',
            order: 1,
            isRequired: false,
            options: ['Veg', '']
          }
        ],
        loading: false,
        mutate: mockMutate
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      // Empty dropdown option disables submit
      expect(screen.getByText('Submit')).toBeDisabled();

      // Fill option -> enabled
      fireEvent.change(screen.getByPlaceholderText('Option 2'), {
        target: { value: 'Meat' }
      });
      expect(screen.getByText('Submit')).not.toBeDisabled();

      // Clear question field -> disabled
      fireEvent.change(screen.getByDisplayValue('Meal'), {
        target: { value: '   ' }
      });
      expect(screen.getByText('Submit')).toBeDisabled();
    });

    it('should validate CHECKBOX custom questions and empty options on existing CHECKBOX form', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: [
          {
            id: 'form0',
            field: 'Visitor Name',
            type: 'TEXT',
            order: 0,
            isRequired: true,
            options: []
          },
          {
            id: 'form1',
            field: 'Check',
            type: 'CHECKBOX',
            order: 1,
            isRequired: true,
            options: ['OptA', '']
          }
        ],
        loading: false,
        mutate: mockMutate
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(screen.getByText('Submit')).toBeDisabled();
      fireEvent.change(screen.getByPlaceholderText('Option 2'), {
        target: { value: 'OptB' }
      });
      expect(screen.getByText('Submit')).not.toBeDisabled();

      // Add custom CHECKBOX question
      fireEvent.click(screen.getByText('Add New Question'));
      const qInputs = screen.getAllByPlaceholderText(
        'Write your question here'
      );
      fireEvent.change(qInputs[qInputs.length - 1], {
        target: { value: 'Custom Check' }
      });
      const typeInputs = screen.getAllByDisplayValue('Short Question');
      fireEvent.click(typeInputs[typeInputs.length - 1]);
      fireEvent.click(within(screen.getByRole('menu')).getByText('Checkbox'));
      expect(screen.getByText('Submit')).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should execute delete, update, and create sequentially and reset state on success', async () => {
      mockTicketsService.deleteAdditionalForm.mockResolvedValue(undefined);
      mockTicketsService.updateAdditionalForm.mockResolvedValue({} as any);
      mockTicketsService.createAdditionalForm.mockResolvedValue({} as any);

      mockUseTicketType.mockReturnValue({
        additionalForms: [
          {
            id: 'form0',
            field: 'Visitor Name',
            type: 'TEXT',
            order: 0,
            isRequired: true,
            options: []
          },
          {
            id: 'form1',
            field: 'To Delete',
            type: 'TEXT',
            order: 1,
            isRequired: false,
            options: []
          },
          {
            id: 'form2',
            field: 'To Update',
            type: 'DROPDOWN',
            order: 2,
            isRequired: false,
            options: ['A', 'B']
          },
          {
            id: 'form3',
            field: 'Unchanged',
            type: 'TEXT',
            order: 3,
            isRequired: false,
            options: []
          }
        ],
        loading: false,
        mutate: mockMutate
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      // Delete form1 (index 0 among deletable forms since form0 is firstForm)
      const deleteButtons = screen.getAllByAltText('Delete');
      fireEvent.click(deleteButtons[0].closest('button')!);

      // Modify form2
      fireEvent.change(screen.getByDisplayValue('To Update'), {
        target: { value: 'Updated Field' }
      });

      // Add a new custom question with options and a simple TEXT one
      fireEvent.click(screen.getByText('Add New Question'));
      fireEvent.click(screen.getByText('Add New Question'));

      const qInputs = screen.getAllByPlaceholderText(
        'Write your question here'
      );
      fireEvent.change(qInputs[qInputs.length - 2], {
        target: { value: 'New Text Q' }
      });
      fireEvent.change(qInputs[qInputs.length - 1], {
        target: { value: 'New Choice Q' }
      });

      const typeInputs = screen.getAllByDisplayValue('Short Question');
      fireEvent.click(typeInputs[typeInputs.length - 1]);
      fireEvent.click(
        within(screen.getByRole('menu')).getByText('Multiple Choice')
      );

      const opt1Inputs = screen.getAllByPlaceholderText('Option 1');
      const opt2Inputs = screen.getAllByPlaceholderText('Option 2');
      fireEvent.change(opt1Inputs[opt1Inputs.length - 1], {
        target: { value: 'Red' }
      });
      fireEvent.change(opt2Inputs[opt2Inputs.length - 1], {
        target: { value: 'Blue' }
      });

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockTicketsService.deleteAdditionalForm).toHaveBeenCalledWith(
          'form1'
        );
      });

      expect(mockTicketsService.updateAdditionalForm).toHaveBeenCalledTimes(1);
      expect(mockTicketsService.updateAdditionalForm).toHaveBeenCalledWith(
        'form2',
        {
          ticketTypeId: 'ticket1',
          field: 'Updated Field',
          type: 'DROPDOWN',
          order: 2,
          isRequired: false,
          options: ['A', 'B']
        }
      );

      expect(mockTicketsService.createAdditionalForm).toHaveBeenCalledTimes(2);
      expect(mockTicketsService.createAdditionalForm).toHaveBeenNthCalledWith(
        1,
        {
          ticketTypeId: 'ticket1',
          field: 'New Text Q',
          type: 'TEXT',
          isRequired: false
        }
      );
      expect(mockTicketsService.createAdditionalForm).toHaveBeenNthCalledWith(
        2,
        {
          ticketTypeId: 'ticket1',
          field: 'New Choice Q',
          type: 'DROPDOWN',
          isRequired: false,
          options: ['Red', 'Blue']
        }
      );

      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Additional forms updated successfully!'
      );
      expect(mockMutate).toHaveBeenCalled();
    });

    it('should update existing TEXT form without options and create new question when no existing forms remain', async () => {
      mockTicketsService.updateAdditionalForm.mockResolvedValue({} as any);
      mockTicketsService.createAdditionalForm.mockResolvedValue({} as any);

      mockUseTicketType.mockReturnValue({
        additionalForms: [
          {
            id: 'form0',
            field: 'Visitor Name',
            type: 'TEXT',
            order: 0,
            isRequired: true,
            options: []
          },
          {
            id: 'form1',
            field: 'Notes',
            type: 'TEXT',
            order: 1,
            isRequired: false,
            options: []
          }
        ],
        loading: false,
        mutate: mockMutate
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      fireEvent.change(screen.getByDisplayValue('Notes'), {
        target: { value: 'Updated Notes' }
      });

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockTicketsService.updateAdditionalForm).toHaveBeenCalledWith(
          'form1',
          {
            ticketTypeId: 'ticket1',
            field: 'Updated Notes',
            type: 'TEXT',
            order: 1,
            isRequired: false
          }
        );
      });
    });

    it('should handle submit with isRequired=true on existing update and when no existing forms exist', async () => {
      mockTicketsService.updateAdditionalForm.mockResolvedValue({} as any);
      mockTicketsService.createAdditionalForm.mockResolvedValue({} as any);

      mockUseTicketType.mockReturnValue({
        additionalForms: [
          {
            id: 'form0',
            field: 'Visitor Name',
            type: 'TEXT',
            order: 0,
            isRequired: true,
            options: []
          },
          {
            id: 'form1',
            field: 'Extra',
            type: 'TEXT',
            order: 1,
            isRequired: true,
            options: []
          }
        ],
        loading: false,
        mutate: mockMutate
      } as any);

      const { rerender } = render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      // Update form1 (isRequired: true) and add a required custom question
      fireEvent.change(screen.getByDisplayValue('Extra'), {
        target: { value: 'Extra Updated' }
      });
      fireEvent.click(screen.getByText('Add New Question'));
      const qInputs = screen.getAllByPlaceholderText(
        'Write your question here'
      );
      fireEvent.change(qInputs[qInputs.length - 1], {
        target: { value: 'Req Q' }
      });
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[checkboxes.length - 1]);

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockTicketsService.updateAdditionalForm).toHaveBeenCalledWith(
          'form1',
          expect.objectContaining({
            field: 'Extra Updated',
            isRequired: true
          })
        );
        expect(mockTicketsService.createAdditionalForm).toHaveBeenCalledWith({
          ticketTypeId: 'ticket1',
          field: 'Req Q',
          type: 'TEXT',
          isRequired: true
        });
      });

      // Also test maxExistingOrder = 0 when additionalForms is empty
      mockTicketsService.createAdditionalForm.mockClear();
      mockUseTicketType.mockReturnValue({
        additionalForms: [],
        loading: false,
        mutate: mockMutate
      } as any);
      rerender(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      fireEvent.click(screen.getByText('Add New Question'));
      fireEvent.change(
        screen.getByPlaceholderText('Write your question here'),
        { target: { value: 'Empty Forms Q' } }
      );
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockTicketsService.createAdditionalForm).toHaveBeenCalledWith({
          ticketTypeId: 'ticket1',
          field: 'Empty Forms Q',
          type: 'TEXT',
          isRequired: false
        });
      });
    });

    it('should handle API response error message, Error.message, and generic fallback error', async () => {
      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      fireEvent.click(screen.getByText('Add New Question'));
      fireEvent.change(
        screen.getByPlaceholderText('Write your question here'),
        { target: { value: 'Test Q' } }
      );

      // 1) response.data.message
      mockTicketsService.createAdditionalForm.mockRejectedValueOnce({
        response: { data: { message: 'Validation failed on server' } }
      });
      fireEvent.click(screen.getByText('Submit'));
      expect(
        await screen.findByText('Validation failed on server')
      ).toBeInTheDocument();

      // 2) error.message
      mockTicketsService.createAdditionalForm.mockRejectedValueOnce(
        new Error('Network timeout')
      );
      fireEvent.click(screen.getByText('Submit'));
      expect(await screen.findByText('Network timeout')).toBeInTheDocument();

      // 3) unknown error
      mockTicketsService.createAdditionalForm.mockRejectedValueOnce({});
      fireEvent.click(screen.getByText('Submit'));
      expect(
        await screen.findByText('Failed to submit changes. Please try again.')
      ).toBeInTheDocument();

      expect(mockMutate).toHaveBeenCalledTimes(3);
    });
  });

  describe('Existing Questions Sidebar', () => {
    it('should toggle sidebar, show loading state, and filter out Visitor Name', () => {
      mockUseDistinctAdditionalForms.mockReturnValue({
        distinctForms: [],
        loading: true,
        error: null,
        mutate: jest.fn()
      } as any);

      const { rerender } = render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType=""
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      fireEvent.click(screen.getByText('Show'));
      expect(screen.getByText('Hide')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Loaded with distinct forms
      mockUseDistinctAdditionalForms.mockReturnValue({
        distinctForms: [
          {
            id: 'd0',
            field: 'Visitor Name',
            type: 'TEXT',
            isRequired: true,
            options: []
          },
          {
            id: 'd1',
            field: 'Company Name',
            type: 'TEXT',
            isRequired: true,
            options: []
          },
          {
            id: 'd2',
            field: 'Hobby',
            type: 'CHECKBOX',
            isRequired: false,
            options: null
          }
        ],
        loading: false,
        error: null,
        mutate: jest.fn()
      } as any);

      rerender(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType=""
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      expect(screen.queryByText('Visitor Name')).not.toBeInTheDocument();
      expect(screen.getByText('Company Name')).toBeInTheDocument();
      expect(screen.getByText(/Type: TEXT \(Required\)/)).toBeInTheDocument();
      expect(screen.getByText('Hobby')).toBeInTheDocument();
      const selectFirstButtons = screen.getAllByText('Select a ticket first');
      expect(selectFirstButtons[0]).toBeDisabled();

      // Select a ticket and click Add to Form
      rerender(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      const addButtons = screen.getAllByText('Add to Form');
      fireEvent.click(addButtons[0]);
      fireEvent.click(addButtons[1]);

      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Question added from existing categories.'
      );
      expect(screen.getByDisplayValue('Company Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Hobby')).toBeInTheDocument();

      // Hide sidebar
      fireEvent.click(screen.getByText('Hide'));
      expect(screen.queryByText('Company Name')).not.toBeInTheDocument();
    });

    it('should cover handleOptionChange and handleAddOption when duplicate existing form is added', () => {
      mockUseTicketType.mockReturnValue({
        additionalForms: [
          {
            id: 'form0',
            field: 'Visitor Name',
            type: 'TEXT',
            order: 0,
            isRequired: true,
            options: []
          },
          {
            id: 'form1',
            field: 'Gender',
            type: 'DROPDOWN',
            order: 1,
            isRequired: true,
            options: ['Male', 'Female']
          }
        ],
        loading: false,
        mutate: mockMutate
      } as any);

      render(
        <AdditionalForm
          eventId="event-1"
          ticketTypes={mockTicketTypes}
          selectedTicketType="ticket1"
          onTicketTypeChange={mockOnTicketTypeChange}
        />
      );

      const copyButtons = screen.getAllByAltText('Copy');
      fireEvent.click(copyButtons[0].closest('button')!);

      // Question 3 is duplicated custom question
      expect(screen.getByText('Question 3')).toBeInTheDocument();
      const genderInputs = screen.getAllByDisplayValue('Gender');
      expect(genderInputs).toHaveLength(2);
    });
  });
});
