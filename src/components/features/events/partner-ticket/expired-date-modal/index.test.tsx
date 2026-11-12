import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { ExpiredDateModal } from './index';

jest.mock('react-datepicker', () => {
  return function MockDatePicker(props: any) {
    return (
      <div>
        {props.customInput}
        <button
          type="button"
          data-testid="pick-future-date"
          onClick={() => props.onChange(new Date(2029, 4, 15))}
        >
          Pick Future Date
        </button>
        <button
          type="button"
          data-testid="pick-past-date"
          onClick={() => props.onChange(new Date(2020, 0, 1))}
        >
          Pick Past Date
        </button>
      </div>
    );
  };
});

describe('ExpiredDateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required fields and past dates before saving', async () => {
    const onSave = jest.fn();

    renderWithProviders(
      <ExpiredDateModal open={true} onClose={jest.fn()} onSave={onSave} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save Time' }));
    await waitFor(() => {
      expect(screen.getByText('Date is required')).toBeInTheDocument();
      expect(screen.getByText('Time is required')).toBeInTheDocument();
      expect(screen.getByText('Time zone is required')).toBeInTheDocument();
    });

    // Pick a past date
    fireEvent.click(screen.getByTestId('pick-past-date'));
    fireEvent.click(screen.getByRole('button', { name: 'Save Time' }));
    await waitFor(() => {
      expect(
        screen.getByText('Date cannot be before today')
      ).toBeInTheDocument();
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('pre-fills from ISO initialValue, saves valid future date/time/timezone, and handles Close button', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();

    renderWithProviders(
      <ExpiredDateModal
        open={true}
        onClose={onClose}
        onSave={onSave}
        initialValue="2029-05-15T14:30:00+07:00"
      />
    );

    // Update time inputs (rendered inside MUI Modal portal) & change timezone
    const timeInputs = document.querySelectorAll('input[maxlength="2"]');
    fireEvent.change(timeInputs[0], { target: { value: '16' } });
    fireEvent.change(timeInputs[1], { target: { value: '45' } });

    fireEvent.click(screen.getByPlaceholderText('Select time zone'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'WITA' }));

    fireEvent.click(screen.getByRole('button', { name: 'Save Time' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          time: '16:45',
          timeZone: '+08:00',
          formattedDate: expect.stringContaining('WITA'),
          isoDate: expect.stringContaining('T16:45:00.000+08:00')
        })
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('catches onSave rejection gracefully and resets on modal Close', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    const onClose = jest.fn();
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderWithProviders(
      <ExpiredDateModal
        open={true}
        onClose={onClose}
        onSave={onSave}
        initialValue="2029-06-10T10:00:00Z"
      />
    );

    fireEvent.click(screen.getByPlaceholderText('Select time zone'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'WIB' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Time' }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save expired date:',
        expect.any(Error)
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });
});
