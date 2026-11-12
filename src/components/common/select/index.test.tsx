import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { CustomSelect } from './index';

describe('CustomSelect', () => {
  const options = [
    { label: 'Option 1', value: 'opt1', icon: '/icon/ticket.svg' },
    { label: 'Option 2', value: 'opt2' }
  ];

  it('renders simple CustomSelect with label, isRejected, icons, selection, and menu close', () => {
    const handleChange = jest.fn();
    const { container } = renderWithProviders(
      <CustomSelect
        label="Category"
        placeholder="Pick one"
        isRejected
        error
        helperText="Invalid selection"
        options={options}
        value="opt1"
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Invalid selection')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="ErrorOutlineIcon"]')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByPlaceholderText('Pick one'));
    expect(screen.getByAltText('Option 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Option 2'));
    expect(handleChange).toHaveBeenCalledWith('opt2');

    // Open and close with Escape
    fireEvent.click(screen.getByPlaceholderText('Pick one'));
    fireEvent.keyDown(screen.getByRole('menu'), {
      key: 'Escape',
      code: 'Escape'
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('integrates with React Hook Form via FormSelect and validates errors', async () => {
    const RHFWrapper = () => {
      const methods = useForm({
        defaultValues: { category: '' }
      });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <CustomSelect
              name="category"
              label="Category"
              placeholder="Select category"
              rules={{ required: 'Category is required' }}
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
      expect(screen.getByText('Category is required')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByPlaceholderText('Select category'));
    fireEvent.click(screen.getByText('Option 2'));
    expect(screen.getByDisplayValue('Option 2')).toBeInTheDocument();
  });
});
