import React from 'react';
import { render, screen } from '@testing-library/react';
import CustomDateField from './index';
import { useForm, FormProvider } from 'react-hook-form';

// Mock common components to avoid circular dependency
jest.mock('../typography', () => ({
  Body2: ({ children }: any) => <div>{children}</div>
}));

// Mock react-datepicker
jest.mock('react-datepicker', () => {
  return function MockDatePicker(props: any) {
    // Format date to local date string (YYYY-MM-DD)
    const formatDate = (date: Date) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return (
      <input
        data-testid="datepicker"
        value={props.selected ? formatDate(props.selected) : ''}
        onChange={(e) => props.onChange(new Date(e.target.value))}
      />
    );
  };
});

// Mock StyledTextField
jest.mock('../text-field/StyledTextField', () => ({
  StyledTextField: (props: any) => <input {...props} />
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      date: '2023-01-01'
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('CustomDateField', () => {
  it('renders correctly', () => {
    render(
      <Wrapper>
        <CustomDateField name="date" label="Select Date" />
      </Wrapper>
    );
    expect(screen.getByText('Select Date')).toBeInTheDocument();
    expect(screen.getByTestId('datepicker')).toBeInTheDocument();
  });

  it('displays initial value', () => {
    render(
      <Wrapper>
        <CustomDateField name="date" label="Select Date" />
      </Wrapper>
    );
    const input = screen.getByTestId('datepicker') as HTMLInputElement;
    expect(input.value).toBe('2023-01-01');
  });
});
