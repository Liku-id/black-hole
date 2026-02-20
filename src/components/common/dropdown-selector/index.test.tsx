import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DropdownSelector from './index';

describe('DropdownSelector', () => {
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ];

  it('renders selected value label', () => {
    render(
      <DropdownSelector
        selectedValue="opt1"
        options={options}
        onValueChange={() => {}}
      />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens menu on click', () => {
    render(
      <DropdownSelector
        selectedValue="opt1"
        options={options}
        onValueChange={() => {}}
      />
    );
    const trigger = screen.getByText('Option 1');
    fireEvent.click(trigger);
    // Check if options are visible
    expect(screen.getByText('Option 2')).toBeVisible();
  });

  it('calls onValueChange when option is selected', () => {
    const handleChange = jest.fn();
    render(
      <DropdownSelector
        selectedValue="opt1"
        options={options}
        onValueChange={handleChange}
      />
    );
    fireEvent.click(screen.getByText('Option 1'));
    fireEvent.click(screen.getByText('Option 2'));
    expect(handleChange).toHaveBeenCalledWith('opt2');
  });
});
