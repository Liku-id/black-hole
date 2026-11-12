import { fireEvent, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { EventDateModal } from './index';

jest.mock('react-datepicker', () => {
  return function MockDatePicker(props: any) {
    return (
      <div>
        {props.customInput}
        <button
          type="button"
          data-testid={`pick-${props.placeholderText}`}
          onClick={() => props.onChange(new Date(2026, 4, 15))}
        >
          Pick
        </button>
        <button
          type="button"
          data-testid={`clear-${props.placeholderText}`}
          onClick={() => props.onChange(null)}
        >
          Clear
        </button>
      </div>
    );
  };
});

const TestWrapper = ({
  children,
  defaultValues = { startDate: '', endDate: '' }
}: any) => {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      {children}
      <div data-testid="end-date-val">{methods.watch('endDate')}</div>
    </FormProvider>
  );
};

describe('EventDateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders conditionally based on open prop', () => {
    const { rerender } = renderWithProviders(
      <TestWrapper>
        <EventDateModal
          open={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      </TestWrapper>
    );
    expect(
      screen.queryByText('Start & End Date Event')
    ).not.toBeInTheDocument();

    rerender(
      <TestWrapper>
        <EventDateModal open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </TestWrapper>
    );
    expect(screen.getByText('Start & End Date Event')).toBeInTheDocument();
  });

  it('does not save when dates missing, clears endDate when startDate is cleared, saves valid range, and closes', async () => {
    renderWithProviders(
      <TestWrapper>
        <EventDateModal open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </TestWrapper>
    );

    // Click save with missing dates -> no save
    fireEvent.click(screen.getByText('Save Data'));
    expect(mockOnSave).not.toHaveBeenCalled();

    // Pick start date then end date
    fireEvent.click(screen.getByTestId('pick-Select start date'));
    fireEvent.click(screen.getByTestId('pick-Select end date'));
    expect(screen.getByTestId('end-date-val')).not.toHaveTextContent('');

    // Clear start date -> effect clears endDate
    fireEvent.click(screen.getByTestId('clear-Select start date'));
    await waitFor(() => {
      expect(screen.getByTestId('end-date-val')).toHaveTextContent('');
    });

    // Pick again & save
    fireEvent.click(screen.getByTestId('pick-Select start date'));
    fireEvent.click(screen.getByTestId('pick-Select end date'));
    fireEvent.click(screen.getByText('Save Data'));

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.stringContaining('May 15, 2026 - May 15, 2026')
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Close icon
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
