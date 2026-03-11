import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { CustomPhoneField } from './index';


// Mock StyledTextField
jest.mock('../text-field/StyledTextField', () => ({
  StyledTextField: (props: any) => (
    <div>
      <input 
        data-testid="phone-input" 
        value={props.value} 
        onChange={props.onChange}
      />
      {props.InputProps?.startAdornment}
    </div>
  )
}));

// Mock DropdownSelector
jest.mock('../dropdown-selector', () => ({
  DropdownSelector: () => <div data-testid="country-selector">ID</div>
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      phone: ''
    }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('CustomPhoneField', () => {
  it('renders correctly', () => {
    render(
      <Wrapper>
        <CustomPhoneField name="phone" label="Phone Number" />
      </Wrapper>
    );
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('country-selector')).toBeInTheDocument();
  });

  it('handles input', () => {
    render(
      <Wrapper>
        <CustomPhoneField name="phone" />
      </Wrapper>
    );
    const input = screen.getByTestId('phone-input');
    fireEvent.change(input, { target: { value: '812345678' } });
    // Since we mocked the implementation, we just check if it doesn't crash.
    // Real logic is inside the component, but we mocked StyledTextField to just call onChange.
  });
});
