import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Discount } from '@/services/discounts';
import { dateUtils } from '@/utils';

import { DiscountModal } from './DiscountModal';

jest.mock('@/components/common', () => {
  const { Controller, useFormContext } = require('react-hook-form');
  const MockFormTextArea = ({
    name,
    label,
    placeholder,
    disabled,
    rules
  }: any) => {
    const { control } = useFormContext();
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }: any) => (
          <div>
            {label && <label htmlFor={`textarea-${name}`}>{label}</label>}
            <textarea
              id={`textarea-${name}`}
              aria-label={label}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </div>
        )}
      />
    );
  };
  return {
    Modal: ({ open, title, onClose, footer, children }: any) =>
      open ? (
        <div role="dialog" aria-label={title}>
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>
            ModalClose
          </button>
          <div>{children}</div>
          <footer>{footer}</footer>
        </div>
      ) : null,
    Button: ({ children, onClick, disabled, type = 'button', form }: any) => (
      <button
        type={type}
        form={form}
        disabled={Boolean(disabled)}
        onClick={onClick}
      >
        {children}
      </button>
    ),
    TextField: ({ name, label, placeholder, disabled, type, rules }: any) => {
      const {
        control,
        formState: { errors }
      } = useFormContext();
      return (
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field }: any) => (
            <div>
              {label && <label htmlFor={`input-${name}`}>{label}</label>}
              <input
                id={`input-${name}`}
                aria-label={label}
                type={type || 'text'}
                placeholder={placeholder}
                disabled={disabled}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
              />
              {errors[name] && (
                <span role="alert">{errors[name].message as string}</span>
              )}
            </div>
          )}
        />
      );
    },
    TextArea: (props: any) => {
      if (!props.name) {
        return (
          <div>
            {props.label && (
              <label htmlFor="standalone-textarea">{props.label}</label>
            )}
            <textarea
              id="standalone-textarea"
              aria-label={props.label}
              placeholder={props.placeholder}
              disabled={props.disabled}
              value={props.value ?? ''}
              onChange={props.onChange}
            />
          </div>
        );
      }
      return <MockFormTextArea {...props} />;
    },
    Select: ({ name, label, disabled, options, rules }: any) => {
      const { control } = useFormContext();
      return (
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field }: any) => (
            <div>
              {label && <label htmlFor={`select-${name}`}>{label}</label>}
              <select
                id={`select-${name}`}
                aria-label={label}
                disabled={disabled}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {options.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        />
      );
    },
    DateField: ({ name, label, placeholder, disabled, rules }: any) => {
      const {
        control,
        formState: { errors }
      } = useFormContext();
      return (
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field }: any) => (
            <div>
              {label && <label htmlFor={`date-${name}`}>{label}</label>}
              <input
                id={`date-${name}`}
                aria-label={label}
                placeholder={placeholder}
                disabled={disabled}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
              />
              {errors[name] && (
                <span role="alert">{errors[name].message as string}</span>
              )}
            </div>
          )}
        />
      );
    },
    TimeField: ({ name, label, placeholder, disabled, rules }: any) => {
      const { control } = useFormContext();
      return (
        <Controller
          control={control}
          name={name}
          rules={rules}
          render={({ field }: any) => (
            <div>
              {label && (
                <label htmlFor={`time-${name}`}>{`${label}-${name}`}</label>
              )}
              <input
                id={`time-${name}`}
                aria-label={`${label}-${name}`}
                placeholder={placeholder}
                disabled={disabled}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
              />
            </div>
          )}
        />
      );
    },
    Body2: ({ children }: any) => <span>{children}</span>,
    Caption: ({ children }: any) => <span>{children}</span>
  };
});

jest.mock('../../../../status-badge', () => ({
  StatusBadge: ({ status, displayName }: any) => (
    <span data-testid="status-badge">{displayName || status}</span>
  )
}));

describe('DiscountModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnApproveReject = jest.fn();

  const mockTicket = {
    id: 'ticket-1',
    name: 'VIP Pass',
    price: 100000
  };

  const mockPercentageDiscount: Discount = {
    id: 'disc-1',
    ticket_type_id: 'ticket-1',
    name: 'Early Bird',
    description: '20% off',
    value: 20,
    start_date: '2026-01-15T10:00:00.000Z',
    end_date: '2026-01-20T16:59:00.000Z',
    status: 'pending'
  };

  const mockNominalDiscount: Discount = {
    id: 'disc-2',
    ticket_type_id: 'ticket-1',
    name: 'Flat Cut',
    value: 25000,
    start_date: '2026-02-01T00:00:00.000Z',
    end_date: '2026-02-05T10:00:00.000Z',
    status: 'rejected',
    rejected_reason: 'Discount too large'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
    mockOnDelete.mockResolvedValue(undefined);
    mockOnApproveReject.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <DiscountModal
        open={false}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={null}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render create mode with default values and submit new percentage discount', async () => {
    const formatSpy = jest.spyOn(dateUtils, 'formatDateISO');

    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={null}
        sessionRole="event_organizer_pic"
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    expect(
      screen.getByText('Create Discount for VIP Pass')
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Discount Name'), {
      target: { value: 'Flash Sale' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Limited offer' }
    });
    fireEvent.change(screen.getByLabelText('Discount Value'), {
      target: { value: '25' }
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2026-03-01' }
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2026-03-05' }
    });

    expect(screen.getByText(/Original Price:/)).toBeInTheDocument();
    expect(screen.getByText(/75\.000/)).toBeInTheDocument();

    fireEvent.submit(document.getElementById('discount-form')!);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket_type_id: 'ticket-1',
          name: 'Flash Sale',
          description: 'Limited offer',
          value: 25
        })
      );
    });
    expect(formatSpy).toHaveBeenCalledTimes(2);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should populate form for existing nominal rejected discount and display rejection reason', () => {
    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={mockNominalDiscount}
        sessionRole="event_organizer_pic"
        eventStatus="on_going"
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    expect(screen.getByText('Discount for VIP Pass')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('rejected');
    expect(screen.getByText('Rejection Reason:')).toBeInTheDocument();
    expect(screen.getByText('Discount too large')).toBeInTheDocument();
    expect(screen.getByLabelText('Discount Option')).toHaveValue('nominal');
    expect(screen.getByLabelText('Discount Value')).toHaveValue(25000);
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByText('Save Discount')).toBeInTheDocument();
  });

  it('should handle invalid or empty ISO dates gracefully in parseIsoToParts', () => {
    const invalidDateDiscount: Discount = {
      ...mockPercentageDiscount,
      start_date: 'not-a-valid-date',
      end_date: ''
    };

    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={invalidDateDiscount}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    expect(screen.getByLabelText('Start Date')).toHaveValue('');
    expect(screen.getByLabelText('Time-startTime')).toHaveValue('00:00');
    expect(screen.getByLabelText('End Date')).toHaveValue('');
  });

  it('should show preview validation errors for invalid percentage and nominal values', () => {
    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={null}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    const valueInput = screen.getByLabelText('Discount Value');
    const typeSelect = screen.getByLabelText('Discount Option');

    // Zero / negative value -> no preview
    fireEvent.change(valueInput, { target: { value: '0' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Percentage > 100
    fireEvent.change(valueInput, { target: { value: '120' } });
    expect(
      screen.getByText('Percentage value must not exceed 100%')
    ).toBeInTheDocument();
    expect(screen.getByText('Save Discount')).toBeDisabled();

    // Switch to nominal with value <= 100
    fireEvent.change(typeSelect, { target: { value: 'nominal' } });
    expect(valueInput).toHaveAttribute('placeholder', 'e.g. 25000');
    fireEvent.change(valueInput, { target: { value: '50' } });
    expect(
      screen.getByText('Nominal value must be greater than 100')
    ).toBeInTheDocument();

    // Nominal exceeding ticket price
    fireEvent.change(valueInput, { target: { value: '150000' } });
    expect(
      screen.getByText('Discount value must not exceed the ticket price')
    ).toBeInTheDocument();

    // Valid nominal preview
    fireEvent.change(valueInput, { target: { value: '30000' } });
    expect(screen.getByText(/Original Price:/)).toBeInTheDocument();
    expect(screen.getByText('Save Discount')).not.toBeDisabled();
  });

  it('should alert when submitting invalid percentage > 100 or nominal <= 100 directly', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={null}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    fireEvent.change(screen.getByLabelText('Discount Name'), {
      target: { value: 'Invalid' }
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2026-03-01' }
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2026-03-02' }
    });
    fireEvent.change(screen.getByLabelText('Discount Value'), {
      target: { value: '150' }
    });

    fireEvent.submit(document.getElementById('discount-form')!);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Percentage value must not exceed 100%'
      );
    });
    expect(mockOnSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Discount Option'), {
      target: { value: 'nominal' }
    });
    fireEvent.change(screen.getByLabelText('Discount Value'), {
      target: { value: '100' }
    });

    fireEvent.submit(document.getElementById('discount-form')!);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Nominal value must be greater than 100'
      );
    });
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should delete existing discount or just close when value is empty in draft/approved eventStatus', async () => {
    const { rerender } = render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={mockPercentageDiscount}
        eventStatus="draft"
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    fireEvent.change(screen.getByLabelText('Discount Value'), {
      target: { value: '' }
    });
    fireEvent.submit(document.getElementById('discount-form')!);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('disc-1');
    });
    expect(mockOnClose).toHaveBeenCalled();

    jest.clearAllMocks();

    rerender(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={null}
        eventStatus="approved"
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    fireEvent.change(screen.getByLabelText('Discount Name'), {
      target: { value: 'Empty Val' }
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2026-03-01' }
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2026-03-02' }
    });
    fireEvent.submit(document.getElementById('discount-form')!);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle save failure gracefully and log error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockOnSave.mockRejectedValueOnce(new Error('Save failed'));

    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={null}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    fireEvent.change(screen.getByLabelText('Discount Name'), {
      target: { value: 'Promo' }
    });
    fireEvent.change(screen.getByLabelText('Discount Value'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2026-03-01' }
    });
    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2026-03-02' }
    });

    fireEvent.submit(document.getElementById('discount-form')!);

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should support delete confirmation and error handling', async () => {
    const confirmSpy = jest.spyOn(window, 'confirm');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={mockPercentageDiscount}
        sessionRole="admin"
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    // Cancel confirm
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(screen.getByText('Delete Discount'));
    expect(mockOnDelete).not.toHaveBeenCalled();

    // Accept confirm with rejection error
    confirmSpy.mockReturnValueOnce(true);
    mockOnDelete.mockRejectedValueOnce(new Error('Delete error'));
    fireEvent.click(screen.getByText('Delete Discount'));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });

    // Accept confirm with success
    confirmSpy.mockReturnValueOnce(true);
    mockOnDelete.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByText('Delete Discount'));

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('disc-1');
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should allow privileged reviewer to approve or reject pending discount', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={mockPercentageDiscount}
        sessionRole="business_development"
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    // Approve error path
    mockOnApproveReject.mockRejectedValueOnce(new Error('Approve failed'));
    fireEvent.click(screen.getByText('Approve Discount'));
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });

    // Approve success
    mockOnApproveReject.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByText('Approve Discount'));
    await waitFor(() => {
      expect(mockOnApproveReject).toHaveBeenCalledWith('disc-1', 'approved');
    });
    expect(mockOnClose).toHaveBeenCalled();

    // Open reject form & cancel rejection
    fireEvent.click(screen.getByText('Reject Discount'));
    expect(screen.getByText('Review Pending Discount')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel Rejection'));
    expect(
      screen.queryByText('Review Pending Discount')
    ).not.toBeInTheDocument();

    // Re-open reject form & submit with empty reason -> alert
    fireEvent.click(screen.getByText('Reject Discount'));
    fireEvent.click(screen.getByText('Confirm Reject'));
    expect(alertSpy).toHaveBeenCalledWith('Please enter a rejection reason.');

    // Enter reason & reject error path
    fireEvent.change(screen.getByLabelText('Rejection Reason'), {
      target: { value: '  Invalid dates  ' }
    });
    mockOnApproveReject.mockRejectedValueOnce(new Error('Reject failed'));
    fireEvent.click(screen.getByText('Confirm Reject'));
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });

    // Reject success
    mockOnApproveReject.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByText('Confirm Reject'));
    await waitFor(() => {
      expect(mockOnApproveReject).toHaveBeenCalledWith(
        'disc-1',
        'rejected',
        'Invalid dates'
      );
    });
  });

  it('should disable form and hide edit/delete buttons in approvalMode or non-editable approved discount', () => {
    const approvedDiscount: Discount = {
      ...mockPercentageDiscount,
      status: 'approved'
    };

    const { rerender } = render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={approvedDiscount}
        sessionRole="event_organizer_pic"
        eventStatus="on_going"
        approvalMode={false}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    expect(screen.queryByText('Save Discount')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Discount')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Discount Name')).toBeDisabled();

    rerender(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={mockPercentageDiscount}
        sessionRole="admin"
        approvalMode={true}
        loading={true}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    expect(screen.queryByText('Save Discount')).not.toBeInTheDocument();
    expect(screen.getByText('Approve Discount')).toBeDisabled();
    expect(screen.getByText('Reject Discount')).toBeDisabled();
  });

  it('should show Saving... text when loading is true and editable', () => {
    render(
      <DiscountModal
        open={true}
        onClose={mockOnClose}
        ticket={mockTicket}
        discount={null}
        loading={true}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onApproveReject={mockOnApproveReject}
      />
    );

    expect(screen.getByText('Saving...')).toBeDisabled();
  });
});
