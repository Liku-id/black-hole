import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { TicketCreateModal } from './index';

jest.mock('../date-modal', () => ({
  TicketDateModal: ({
    open,
    title,
    onClose,
    onSave,
    minDate,
    maxDate
  }: any) => {
    if (!open) return null;
    return (
      <div
        data-testid={`date-modal-${title}`}
        data-has-min={String(Boolean(minDate))}
        data-has-max={String(Boolean(maxDate))}
      >
        <span>{title}</span>
        <button type="button" onClick={onClose}>
          Close {title}
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({
              date: '2026-06-15',
              time: '14:00',
              timeZone: '+07:00',
              formattedDate: 'Jun 15, 2026, 14:00 WIB'
            })
          }
        >
          Save {title}
        </button>
      </div>
    );
  }
}));

describe('TicketCreateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const mockEditingTicket = {
    id: '1',
    name: 'VIP Ticket',
    description: 'VIP description',
    colorHex: 'FF0000',
    price: 100000,
    quantity: 100,
    maxPerUser: 5,
    salesStartDate: '2024-01-10T00:00:00.000Z',
    salesEndDate: '2024-01-20T00:00:00.000Z',
    ticketStartDate: '2024-01-15T00:00:00.000Z',
    ticketEndDate: '2024-01-20T00:00:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Modal Visibility & Tabs', () => {
    it('should render when open is true and not render when open is false', () => {
      const { rerender } = render(
        <TicketCreateModal
          open={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByText('Ticket Category')).not.toBeInTheDocument();

      rerender(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Ticket Category')).toBeInTheDocument();
      expect(screen.getByText('Detail Ticket')).toBeInTheDocument();
      expect(screen.getByText('Additional Form')).toBeInTheDocument();
    });

    it('should switch to Additional Form tab for new ticket and editing ticket', () => {
      const { rerender } = render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByText('Additional Form'));
      expect(
        screen.getByText(
          /Additional forms can be configured after the ticket category is saved/i
        )
      ).toBeInTheDocument();
      expect(screen.queryByText('Save Ticket')).not.toBeInTheDocument();

      rerender(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editingTicket={mockEditingTicket}
        />
      );

      expect(
        screen.getByText(
          /Additional forms for this ticket can be managed from the 'Edit Additional Form' menu/i
        )
      ).toBeInTheDocument();

      fireEvent.click(screen.getByText('Detail Ticket'));
      expect(screen.getByText('Save Ticket')).toBeInTheDocument();
    });

    it('should call onClose when Cancel or modal Close button is clicked', () => {
      render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByLabelText('Close'));
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('Form Validation & Creation Submission', () => {
    it('should validate required and pattern rules', async () => {
      render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByText('Save Ticket'));

      expect(
        await screen.findByText('Ticket name is required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Ticket description is required')
      ).toBeInTheDocument();
      expect(screen.getByText('Color hex is required')).toBeInTheDocument();
      expect(screen.getByText('Ticket price is required')).toBeInTheDocument();
      expect(
        screen.getByText('Ticket quantity is required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Max ticket per user is required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Sales start date is required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Sales end date is required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Ticket start date is required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Ticket end date is required')
      ).toBeInTheDocument();

      // Pattern validation
      fireEvent.change(screen.getByPlaceholderText('Ticket/Category Name'), {
        target: { value: 'VIP' }
      });
      fireEvent.change(screen.getByPlaceholderText('Max. 500 characters'), {
        target: { value: 'Desc' }
      });
      const textInputs = screen.getAllByRole('textbox');
      // colorHex is index 2, price is index 3
      fireEvent.change(textInputs[2], { target: { value: 'BAD' } });
      fireEvent.change(textInputs[3], { target: { value: 'abc' } });
      fireEvent.change(screen.getByPlaceholderText('Ticket quantity'), {
        target: { value: 'xyz' }
      });
      fireEvent.change(screen.getByPlaceholderText('ex: 6 ticket per user'), {
        target: { value: 'nope' }
      });

      fireEvent.click(screen.getByText('Save Ticket'));

      expect(
        await screen.findByText('Please enter a valid hex color (e.g., FF0000)')
      ).toBeInTheDocument();
      expect(screen.getByText('Price must be a number')).toBeInTheDocument();
      expect(screen.getByText('Quantity must be a number')).toBeInTheDocument();
      expect(
        screen.getByText('Max ticket per user must be a number')
      ).toBeInTheDocument();
    });

    it('should open/close all four date modals, save dates, and submit new ticket', async () => {
      render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          eventStartDate="2026-06-01T00:00:00.000Z"
          eventEndDate="2026-06-30T00:00:00.000Z"
        />
      );

      fireEvent.change(screen.getByPlaceholderText('Ticket/Category Name'), {
        target: { value: 'Early Bird' }
      });
      fireEvent.change(screen.getByPlaceholderText('Max. 500 characters'), {
        target: { value: 'Early access ticket' }
      });
      const textInputs = screen.getAllByRole('textbox');
      fireEvent.change(textInputs[2], { target: { value: 'FF5500' } });
      fireEvent.change(textInputs[3], { target: { value: '150000' } });
      fireEvent.change(screen.getByPlaceholderText('Ticket quantity'), {
        target: { value: '50' }
      });
      fireEvent.change(screen.getByPlaceholderText('ex: 6 ticket per user'), {
        target: { value: '4' }
      });

      // Open and close Sales Start Date modal, then reopen and save
      const salesStartInput = screen.getByPlaceholderText(
        'Ticket sale will start on this date'
      );
      fireEvent.click(salesStartInput);
      expect(screen.getByTestId('date-modal-Sales Start Date')).toHaveAttribute(
        'data-has-max',
        'true'
      );
      fireEvent.click(screen.getByText('Close Sales Start Date'));
      expect(
        screen.queryByTestId('date-modal-Sales Start Date')
      ).not.toBeInTheDocument();

      fireEvent.click(salesStartInput);
      fireEvent.click(screen.getByText('Save Sales Start Date'));

      // Sales End Date
      const salesEndInput = screen.getByPlaceholderText(
        'Ticket sale will end on this date'
      );
      fireEvent.click(salesEndInput);
      fireEvent.click(screen.getByText('Close Sales End Date'));
      fireEvent.click(salesEndInput);
      fireEvent.click(screen.getByText('Save Sales End Date'));

      // Ticket Start & End Date
      const ticketDateInputs = screen.getAllByPlaceholderText(
        'Ticket for date event'
      );
      fireEvent.click(ticketDateInputs[0]);
      expect(
        screen.getByTestId('date-modal-Ticket Start Date')
      ).toHaveAttribute('data-has-min', 'true');
      fireEvent.click(screen.getByText('Close Ticket Start Date'));
      fireEvent.click(ticketDateInputs[0]);
      fireEvent.click(screen.getByText('Save Ticket Start Date'));

      fireEvent.click(ticketDateInputs[1]);
      fireEvent.click(screen.getByText('Close Ticket End Date'));
      fireEvent.click(ticketDateInputs[1]);
      fireEvent.click(screen.getByText('Save Ticket End Date'));

      fireEvent.click(screen.getByText('Save Ticket'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Early Bird',
            description: 'Early access ticket',
            colorHex: 'FF5500',
            price: '150000',
            quantity: '50',
            maxPerUser: '4',
            salesStartDate: 'Jun 15, 2026, 14:00 WIB',
            salesEndDate: 'Jun 15, 2026, 14:00 WIB',
            ticketStartDate: 'Jun 15, 2026, 14:00 WIB',
            ticketEndDate: 'Jun 15, 2026, 14:00 WIB'
          })
        );
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should log error and reset loading if onSubmit rejects', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockOnSubmit.mockRejectedValueOnce(new Error('Submit failed'));

      render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          editingTicket={mockEditingTicket}
        />
      );

      fireEvent.click(screen.getByText('Save Ticket'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to create ticket:',
          expect.any(Error)
        );
      });
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(screen.getByText('Save Ticket')).not.toBeDisabled();
    });
  });

  describe('Editing & Rejected Fields Validation', () => {
    it('should display rejection banner when eventStatus is rejected/draft/on_going and ticket is rejected', () => {
      render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          eventStatus="rejected"
          editingTicket={{
            ...mockEditingTicket,
            status: 'rejected',
            rejectedReason: 'Price too high',
            rejectedFields: ['name', 'price']
          }}
        />
      );

      expect(screen.getByText('Rejection Reason:')).toBeInTheDocument();
      expect(screen.getByText('Price too high')).toBeInTheDocument();
    });

    it('should not display rejection banner if rejectedReason is blank', () => {
      render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          eventStatus="draft"
          editingTicket={{
            ...mockEditingTicket,
            status: 'rejected',
            rejectedReason: '   ',
            rejectedFields: ['name']
          }}
        />
      );

      expect(screen.queryByText('Rejection Reason:')).not.toBeInTheDocument();
    });

    it('should alert when no rejected fields were modified on on_going/rejected event', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          eventStatus="on_going"
          editingTicket={{
            ...mockEditingTicket,
            status: 'rejected',
            rejectedReason: 'Fix all',
            rejectedFields: [
              'name',
              'description',
              'price',
              'quantity',
              'max_order_quantity',
              'sales_start_date',
              'sales_end_date',
              'ticketStartDate',
              'ticketEndDate'
            ],
            originalSalesStartDate: '2024-01-10T00:00:00.000Z',
            originalSalesEndDate: '2024-01-20T00:00:00.000Z',
            originalTicketStartDate: '2024-01-15T00:00:00.000Z',
            originalTicketEndDate: '2024-01-20T00:00:00.000Z'
          }}
        />
      );

      fireEvent.click(screen.getByText('Save Ticket'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Please fix all rejected fields before saving. Rejected fields must be changed.'
        );
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should allow submission when a rejected text/numeric field is updated', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          eventStatus="rejected"
          editingTicket={{
            ...mockEditingTicket,
            status: 'rejected',
            rejectedReason: 'Bad quantity',
            rejectedFields: ['quantity']
          }}
        />
      );

      fireEvent.change(screen.getByPlaceholderText('Ticket quantity'), {
        target: { value: '200' }
      });

      fireEvent.click(screen.getByText('Save Ticket'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should detect changed rejected date fields using raw date parts', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      const { rerender } = render(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          eventStatus="rejected"
          editingTicket={{
            ...mockEditingTicket,
            status: 'rejected',
            rejectedFields: ['sales_start_date']
          }}
        />
      );

      fireEvent.click(
        screen.getByPlaceholderText('Ticket sale will start on this date')
      );
      fireEvent.click(screen.getByText('Save Sales Start Date'));
      fireEvent.click(screen.getByText('Save Ticket'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });

      // Test sales_end_date, ticketStartDate, ticketEndDate branches
      rerender(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          eventStatus="rejected"
          editingTicket={{
            ...mockEditingTicket,
            status: 'rejected',
            rejectedFields: ['sales_end_date'],
            salesEndRawDate: '2024-01-20',
            salesEndTime: '00:00',
            salesEndTimeZone: '+07:00'
          }}
        />
      );

      fireEvent.click(
        screen.getByPlaceholderText('Ticket sale will end on this date')
      );
      fireEvent.click(screen.getByText('Save Sales End Date'));
      fireEvent.click(screen.getByText('Save Ticket'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(2);
      });

      rerender(
        <TicketCreateModal
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          eventStatus="rejected"
          editingTicket={{
            ...mockEditingTicket,
            status: 'rejected',
            rejectedFields: ['ticketStartDate', 'ticketEndDate']
          }}
        />
      );

      const ticketDateInputs = screen.getAllByPlaceholderText(
        'Ticket for date event'
      );
      fireEvent.click(ticketDateInputs[0]);
      fireEvent.click(screen.getByText('Save Ticket Start Date'));
      fireEvent.click(ticketDateInputs[1]);
      fireEvent.click(screen.getByText('Save Ticket End Date'));
      fireEvent.click(screen.getByText('Save Ticket'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(3);
      });
      expect(alertSpy).not.toHaveBeenCalled();
    });
  });
});
