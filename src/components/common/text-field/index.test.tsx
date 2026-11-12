import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { CustomTextField } from './index';

describe('CustomTextField', () => {
  it('renders standalone field with label, helperText, and adornments', () => {
    renderWithProviders(
      <CustomTextField
        label="Test Label"
        value="abc"
        error
        helperText="Invalid input"
        startComponent={<span data-testid="start">Start</span>}
        endComponent={<span data-testid="end">End</span>}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('renders standalone field without adornments or label', () => {
    renderWithProviders(
      <CustomTextField placeholder="Bare input" defaultValue="" />
    );
    expect(screen.getByPlaceholderText('Bare input')).toBeInTheDocument();
  });

  it('integrates with React Hook Form, formats value, shows adornments, rejected icon, and validation error', async () => {
    const RHFWrapper = () => {
      const methods = useForm({
        defaultValues: { code: '', plain: '' },
        mode: 'onChange'
      });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <CustomTextField
              name="code"
              label="Code"
              placeholder="Enter code"
              isRejected
              rules={{ required: 'Code is required' }}
              formatValue={(val) => val.toUpperCase()}
              startComponent={<span>Prefix</span>}
              endComponent={<span>Suffix</span>}
            />
            <CustomTextField name="plain" placeholder="Plain input" />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    const { container } = render(<RHFWrapper />);
    expect(screen.getByText('Prefix')).toBeInTheDocument();
    expect(screen.getByText('Suffix')).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="ErrorOutlineIcon"]')
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Enter code');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue('ABC');

    const plainInput = screen.getByPlaceholderText('Plain input');
    fireEvent.change(plainInput, { target: { value: 'hello' } });
    expect(plainInput).toHaveValue('hello');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(screen.getByText('Code is required')).toBeInTheDocument();
    });
  });
});
