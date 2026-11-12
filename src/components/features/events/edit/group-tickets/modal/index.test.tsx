import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GroupTicketCreateModal } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('../../../create/ticket/date-modal', () => ({
  TicketDateModal: ({ open, title, onClose, onSave }: any) => {
    if (!open) return null;
    return (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        <button type="button" onClick={onClose}>
          Close Date Modal
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({
              date: '2026-12-31',
              time: '12:00',
              timeZone: '+07:00',
              formattedDate: 'Dec 31, 2026, 12:00 WIB'
            })
          }
        >
          Save Date
        </button>
      </div>
    );
  }
}));

jest.mock('@/components/common', () => {
  const { useFormContext } = require('react-hook-form');
  return {
    Modal: ({ children, title, open, onClose, footer }: any) =>
      open ? (
        <div role="dialog" aria-label={title}>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="close">
            X
          </button>
          <div data-testid="modal-content">{children}</div>
          <div data-testid="modal-footer">{footer}</div>
        </div>
      ) : null,
    Button: (props: any) => (
      <button
        type={props.type || 'button'}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.children}
      </button>
    ),
    TextField: ({
      name,
      label,
      placeholder,
      rules,
      InputProps,
      onClick
    }: any) => {
      const {
        register,
        formState: { errors }
      } = useFormContext();
      const error = errors[name];
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            placeholder={placeholder}
            {...register(name, rules)}
            readOnly={InputProps?.readOnly}
            onClick={onClick}
            aria-invalid={error ? 'true' : 'false'}
          />
          {error && <span role="alert">{error.message as string}</span>}
        </div>
      );
    },
    TextArea: ({ name, label, placeholder, rules }: any) => {
      const {
        register,
        formState: { errors }
      } = useFormContext();
      const error = errors[name];
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <textarea
            id={name}
            placeholder={placeholder}
            {...register(name, rules)}
          />
          {error && <span role="alert">{error.message as string}</span>}
        </div>
      );
    },
    Select: ({ name, label, options, rules }: any) => {
      const {
        register,
        formState: { errors }
      } = useFormContext();
      const error = errors[name];
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <select id={name} {...register(name, rules)}>
            <option value="">Select</option>
            {options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <span role="alert">{error.message as string}</span>}
        </div>
      );
    },
    Body2: ({ children }: any) => <div>{children}</div>
  };
});

describe('GroupTicketCreateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockTicketTypes = [
    { id: 't1', name: 'VIP', price: 100 },
    { id: 't2', name: 'Regular', price: 50 }
  ];

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    ticketTypes: mockTicketTypes as any,
    eventStatus: 'draft',
    eventEndDate: '2026-12-31T23:59:59Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits complete valid form and closes modal', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<GroupTicketCreateModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Ticket Type*'), {
      target: { value: 't1' }
    });
    fireEvent.change(screen.getByLabelText(/G. Ticket Name*/i), {
      target: { value: 'My Group Ticket' }
    });
    fireEvent.change(screen.getByLabelText(/Bundle Qty*/i), {
      target: { value: '5' }
    });
    fireEvent.change(screen.getByLabelText(/G. Ticket Description*/i), {
      target: { value: 'Description here' }
    });
    fireEvent.change(screen.getByLabelText(/G. Ticket Price*/i), {
      target: { value: '100000' }
    });
    fireEvent.change(screen.getByLabelText(/Ticket Type Qty*/i), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText(/Max. G. Ticket Per User*/i), {
      target: { value: '2' }
    });

    // Open start date modal -> close via Close first, then reopen and Save Date
    fireEvent.click(screen.getByLabelText(/Sales Start Date*/i));
    expect(screen.getByText('Sales Start Date')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close Date Modal' }));
    expect(screen.queryByText('Sales Start Date')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Sales Start Date*/i));
    fireEvent.click(screen.getByRole('button', { name: 'Save Date' }));

    // Open end date modal -> close via Close first, then reopen and Save Date
    fireEvent.click(screen.getByLabelText(/Sales End Date*/i));
    expect(screen.getByText('Sales End Date')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close Date Modal' }));
    expect(screen.queryByText('Sales End Date')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Sales End Date*/i));
    fireEvent.click(screen.getByRole('button', { name: 'Save Date' }));

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketTypeId: 't1',
          name: 'My Group Ticket',
          bundleQuantity: '5',
          salesStartDate: 'Dec 31, 2026, 12:00 WIB',
          salesEndDate: 'Dec 31, 2026, 12:00 WIB'
        })
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('validates required fields and handles submission errors', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    render(<GroupTicketCreateModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText('Ticket name is required')
    ).toBeInTheDocument();
    expect(screen.getByText('Ticket type is required')).toBeInTheDocument();

    // Test onSubmit rejection with editingTicket prefilled
    mockOnSubmit.mockRejectedValueOnce(new Error('API failed'));
    const editingTicket = {
      id: '1',
      ticketTypeId: 't1',
      name: 'Existing Ticket',
      description: 'Existing Desc',
      price: 150000,
      quantity: 50,
      bundleQuantity: 3,
      maxOrderQuantity: 1,
      salesStartDate: '2026-01-01 10:00',
      salesEndDate: '2026-01-02 10:00',
      status: 'rejected',
      rejectedReason: 'Price too low'
    };

    render(
      <GroupTicketCreateModal
        {...defaultProps}
        eventStatus="rejected"
        editingTicket={editingTicket as any}
      />
    );

    expect(await screen.findByText('Rejection Reason:')).toBeInTheDocument();
    expect(screen.getByText('Price too low')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Ticket')).toBeInTheDocument();

    const saveButtons = screen.getAllByRole('button', { name: 'Save' });
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to create group ticket:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('hides rejection reason when blank or status is not rejected and closes on Cancel', () => {
    const { rerender } = render(
      <GroupTicketCreateModal
        {...defaultProps}
        eventStatus="on_going"
        editingTicket={{
          id: '1',
          ticketTypeId: 't1',
          name: 'T1',
          description: 'D',
          price: 10,
          quantity: 10,
          bundleQuantity: 2,
          maxOrderQuantity: 2,
          salesStartDate: '2026-01-01',
          salesEndDate: '2026-01-02',
          status: 'rejected',
          rejectedReason: '   '
        }}
      />
    );

    expect(screen.queryByText('Rejection Reason:')).not.toBeInTheDocument();

    rerender(
      <GroupTicketCreateModal
        {...defaultProps}
        eventStatus="approved"
        editingTicket={{
          id: '1',
          ticketTypeId: 't1',
          name: 'T1',
          description: 'D',
          price: 10,
          quantity: 10,
          bundleQuantity: 2,
          maxOrderQuantity: 2,
          salesStartDate: '2026-01-01',
          salesEndDate: '2026-01-02',
          status: 'rejected',
          rejectedReason: 'Ignored'
        }}
      />
    );
    expect(screen.queryByText('Rejection Reason:')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
