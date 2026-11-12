import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { CustomDateField } from './index';

jest.mock('react-datepicker', () => {
  return function MockDatePicker(props: any) {
    const formatDate = (date: Date) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const PopperContainer = props.popperContainer;

    return (
      <div>
        {props.customInput}
        <input
          data-testid="datepicker"
          placeholder={props.placeholderText}
          value={props.selected ? formatDate(props.selected) : ''}
          onChange={(e) =>
            props.onChange(e.target.value ? new Date(e.target.value) : null)
          }
        />
        <button
          type="button"
          data-testid="pick-valid"
          onClick={() => props.onChange(new Date(2024, 4, 5))}
        >
          Pick
        </button>
        <button
          type="button"
          data-testid="pick-null"
          onClick={() => props.onChange(null)}
        >
          Clear
        </button>
        {PopperContainer && (
          <div data-testid="popper-wrap">
            <PopperContainer>
              <span>Popper Content</span>
            </PopperContainer>
          </div>
        )}
      </div>
    );
  };
});

const FormWrapper = ({
  defaultDate = '2023-01-01',
  children
}: {
  defaultDate?: string;
  children: React.ReactNode;
}) => {
  const methods = useForm({
    defaultValues: {
      date: defaultDate
    }
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        {children}
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('CustomDateField', () => {
  it('renders label, CustomInput, initial value, popper container, and handles date changes', () => {
    renderWithProviders(
      <FormWrapper defaultDate="2023-01-01">
        <CustomDateField
          id="event-date"
          name="date"
          label="Select Date"
          placeholder="Custom placeholder"
          minDate={new Date(2020, 0, 1)}
          maxDate={new Date(2030, 0, 1)}
        />
      </FormWrapper>
    );

    expect(screen.getByText('Select Date')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Custom placeholder')
    ).toBeInTheDocument();
    expect(screen.getByAltText('calendar')).toBeInTheDocument();
    expect(screen.getByText('Popper Content')).toBeInTheDocument();

    const input = screen.getByTestId('datepicker') as HTMLInputElement;
    expect(input.value).toBe('2023-01-01');

    fireEvent.click(screen.getByTestId('pick-valid'));
    expect(input.value).toBe('2024-05-05');

    fireEvent.click(screen.getByTestId('pick-null'));
    expect(input.value).toBe('');
  });

  it('handles empty and malformed date strings plus validation errors', async () => {
    const { rerender } = renderWithProviders(
      <FormWrapper defaultDate="">
        <CustomDateField name="date" rules={{ required: 'Date is required' }} />
      </FormWrapper>
    );

    const input = screen.getByTestId('datepicker') as HTMLInputElement;
    expect(input.value).toBe('');

    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });

    rerender(
      <FormWrapper defaultDate="invalid-date">
        <CustomDateField name="date" />
      </FormWrapper>
    );
    expect((screen.getByTestId('datepicker') as HTMLInputElement).value).toBe(
      ''
    );
  });
});
