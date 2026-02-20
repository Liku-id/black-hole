import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MultiSelect from './index';

// Mock StyledTextField
jest.mock('../text-field/StyledTextField', () => ({
  StyledTextField: (props: any) => <input data-testid="multiselect-input" onClick={props.onClick} value={props.value} readOnly />
}));

describe('MultiSelect', () => {
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ];

  it('renders correctly', () => {
    render(
      <MultiSelect
        options={options}
        value={[]}
        onChange={() => {}}
      />
    );
    expect(screen.getByTestId('multiselect-input')).toBeInTheDocument();
  });

  it('opens menu and selects option', () => {
    const handleChange = jest.fn();
    render(
      <MultiSelect
        options={options}
        value={[]}
        onChange={handleChange}
      />
    );
    const input = screen.getByTestId('multiselect-input');
    fireEvent.click(input);
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);
    expect(handleChange).toHaveBeenCalledWith(['opt1']);
  });

  it('displays selected values', () => {
    render(
      <MultiSelect
        options={options}
        value={['opt1', 'opt2']}
        onChange={() => {}}
      />
    );
    const input = screen.getByTestId('multiselect-input') as HTMLInputElement;
    expect(input.value).toBe('Option 1, Option 2');
  });
});
