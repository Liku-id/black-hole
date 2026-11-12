import { render, screen, fireEvent } from '@testing-library/react';

import { DropdownSelector } from './index';

describe('DropdownSelector', () => {
  const options = [
    { id: 'id-1', label: 'Option 1', value: 'opt1', displayLabel: 'O1' },
    { id: 'id-2', label: 'Option 2', value: 'opt2' }
  ];

  it('renders selected displayLabel, fallback defaultLabel, and first option fallback', () => {
    const { rerender } = render(
      <DropdownSelector
        selectedValue="opt1"
        options={options}
        onValueChange={() => {}}
      />
    );
    expect(screen.getByText('O1')).toBeInTheDocument();

    rerender(
      <DropdownSelector
        selectedValue="missing"
        defaultLabel="Choose..."
        options={options}
        onValueChange={() => {}}
      />
    );
    expect(screen.getByText('Choose...')).toBeInTheDocument();

    rerender(
      <DropdownSelector
        selectedValue="missing"
        options={options}
        onValueChange={() => {}}
      />
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(
      <DropdownSelector
        selectedValue="opt1"
        options={options}
        disabled={true}
        onValueChange={() => {}}
      />
    );
    fireEvent.click(screen.getByText('O1'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('supports search filtering by label/value, empty results, and selecting an option', () => {
    const handleChange = jest.fn();
    render(
      <DropdownSelector
        id="dropdown-test"
        selectedValue="opt2"
        options={options}
        enableSearch={true}
        onValueChange={handleChange}
      />
    );

    fireEvent.click(screen.getByText('Option 2'));
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.click(searchInput);
    fireEvent.keyDown(searchInput, { key: 'a' });

    fireEvent.change(searchInput, { target: { value: 'zzz' } });
    expect(screen.getByText('No results found')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'opt1' } });
    fireEvent.click(screen.getByText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith('opt1');
  });
});
