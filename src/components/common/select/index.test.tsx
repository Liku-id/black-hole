import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomSelect from './index';

// Mock StyledTextField
jest.mock('../text-field/StyledTextField', () => ({
  StyledTextField: (props: any) => (
    <input 
      data-testid="select-input" 
      readOnly
      onClick={props.onClick}
      value={props.value}
    />
  )
}));

describe('CustomSelect', () => {
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ];

  it('renders correctly', () => {
    render(
      <CustomSelect
        options={options}
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByTestId('select-input')).toBeInTheDocument();
  });

  it('opens menu and selects option', () => {
    const handleChange = jest.fn();
    render(
      <CustomSelect
        options={options}
        value=""
        onChange={handleChange}
      />
    );
    fireEvent.click(screen.getByTestId('select-input'));
    fireEvent.click(screen.getByText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith('opt1');
  });
});
