import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { TicketDateModal } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('react-datepicker', () => {
  return function MockDatePicker(props: any) {
    return (
      <div>
        {props.customInput}
        <button
          type="button"
          data-testid="pick-date"
          onClick={() => props.onChange(new Date(2026, 4, 15))}
        >
          Pick Date
        </button>
      </div>
    );
  };
});

describe('TicketDateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when closed and renders fields when open', () => {
    const { rerender } = render(
      <TicketDateModal
        open={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        title="Test Sales Modal"
      />
    );
    expect(screen.queryByText('Test Sales Modal')).not.toBeInTheDocument();

    rerender(
      <TicketDateModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        title="Test Sales Modal"
      />
    );
    expect(screen.getByText('Test Sales Modal')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Time Zone')).toBeInTheDocument();
  });

  it('shows validation error when date is missing', async () => {
    render(
      <TicketDateModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        title="Sales Start Date"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Date' }));
    await waitFor(() => {
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('submits selected date, time, and timezone and closes modal', async () => {
    mockOnSave.mockResolvedValue(undefined);

    render(
      <TicketDateModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        title="Sales Start Date"
      />
    );

    fireEvent.click(screen.getByTestId('pick-date'));

    const timeInputs = document.querySelectorAll('input[maxlength="2"]');
    fireEvent.change(timeInputs[0], { target: { value: '14' } });
    fireEvent.change(timeInputs[1], { target: { value: '30' } });

    const tzInput = document.querySelector('input[value="WIB"]')!;
    fireEvent.click(tzInput);
    fireEvent.click(screen.getByRole('menuitem', { name: 'WITA' }));
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Date' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2026-05-15',
          time: '14:30',
          timeZone: '+08:00',
          formattedDate: expect.stringContaining('May 15, 2026, 14:30 WITA')
        })
      );
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('catches onSave error gracefully and resets on Cancel', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockOnSave.mockRejectedValue(new Error('Save error'));

    render(
      <TicketDateModal
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        title="Sales End Date"
      />
    );

    fireEvent.click(screen.getByTestId('pick-date'));
    fireEvent.click(screen.getByRole('button', { name: 'Save Date' }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save the date:',
        expect.any(Error)
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });
});
