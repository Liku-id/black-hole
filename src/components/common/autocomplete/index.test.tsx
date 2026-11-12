import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { AutoComplete } from './index';

describe('AutoComplete', () => {
  const options = [
    { id: '1', label: 'Option 1', value: '1' },
    { id: '2', label: 'Option 2', value: '2' },
    { id: '3', label: '', value: '3' }
  ];

  it('renders with label, helperText, and handles selecting object and string options', () => {
    const handleChange = jest.fn();
    const handleInputChange = jest.fn();

    renderWithProviders(
      <AutoComplete
        id="city-ac"
        label="City"
        placeholder="Pick a city"
        options={options}
        value={options[0]}
        helperText="Required field"
        error
        onChange={handleChange}
        onInputChange={handleInputChange}
      />
    );

    const input = screen.getByPlaceholderText(
      'Pick a city'
    ) as HTMLInputElement;
    expect(input.value).toBe('Option 1');
    expect(screen.getByText('Required field')).toBeInTheDocument();

    fireEvent.focus(input);
    fireEvent.mouseDown(input);
    fireEvent.change(input, { target: { value: 'Option' } });
    expect(handleInputChange).toHaveBeenCalled();

    const opt2 = screen.getByText('Option 2');
    fireEvent.click(opt2);
    expect(handleChange).toHaveBeenCalledWith(
      expect.anything(),
      options[1],
      'selectOption',
      expect.anything()
    );
  });

  it('supports freeSolo string value, empty options, and loading state', () => {
    const { rerender } = renderWithProviders(
      <AutoComplete
        label="Free"
        options={[]}
        open={true}
        loading={true}
        loadingText="Fetching..."
        noOptionsText="Nothing"
        value={'Custom text' as any}
      />
    );

    expect(screen.getByText('Fetching...')).toBeInTheDocument();

    rerender(
      <AutoComplete
        label="Free"
        options={[]}
        open={true}
        loading={false}
        noOptionsText="Nothing"
        value={{ id: '3', label: '', value: '3' }}
      />
    );

    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });
});
