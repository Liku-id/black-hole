import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { MultiSelect } from './index';

describe('MultiSelect', () => {
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ];

  it('renders simple MultiSelect with label, rejected icon, helperText, and handles select/deselect/close', () => {
    const handleChange = jest.fn();
    const { container, rerender } = renderWithProviders(
      <MultiSelect
        label="Categories"
        placeholder="Select items"
        isRejected
        error
        helperText="Pick at least one"
        options={options}
        value={[]}
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Pick at least one')).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="ErrorOutlineIcon"]')
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Select items');
    fireEvent.click(input);

    fireEvent.click(screen.getByText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith(['opt1']);

    rerender(
      <MultiSelect
        label="Categories"
        placeholder="Select items"
        options={options}
        value={['opt1', 'unknown']}
        onChange={handleChange}
      />
    );
    expect(
      (screen.getByPlaceholderText('Select items') as HTMLInputElement).value
    ).toBe('Option 1, unknown');

    fireEvent.click(screen.getByText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith(['unknown']);

    fireEvent.keyDown(screen.getByRole('menu'), {
      key: 'Escape',
      code: 'Escape'
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('integrates with React Hook Form via FormMultiSelect and validates errors', async () => {
    const RHFWrapper = () => {
      const methods = useForm<{ tags: string[] }>({
        defaultValues: { tags: [] }
      });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <MultiSelect
              name="tags"
              label="Tags"
              placeholder="Choose tags"
              rules={{ required: 'Tags required' }}
              options={options}
            />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<RHFWrapper />);

    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByText('Tags required')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Choose tags');
    fireEvent.click(input);
    fireEvent.click(screen.getByText('Option 2'));

    expect((input as HTMLInputElement).value).toBe('Option 2');
  });
});
