import { fireEvent, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { CustomPhoneField } from './index';

jest.mock('../dropdown-selector', () => ({
  DropdownSelector: (props: any) => (
    <div>
      <span data-testid="selected-code">{props.selectedValue}</span>
      <button
        type="button"
        data-testid="switch-us"
        onClick={() => props.onValueChange('+1')}
      >
        US
      </button>
    </div>
  )
}));

const FormHarness = ({ defaultPhone = '' }: { defaultPhone?: string }) => {
  const methods = useForm({
    defaultValues: {
      phone: defaultPhone
    }
  });
  return (
    <FormProvider {...methods}>
      <CustomPhoneField
        name="phone"
        label="Phone Number"
        defaultCountryCode="+62"
      />
      <button
        type="button"
        data-testid="set-sg"
        onClick={() => methods.setValue('phone', '+6599887766')}
      >
        SetSG
      </button>
      <button
        type="button"
        data-testid="clear-form"
        onClick={() => methods.setValue('phone', '')}
      >
        ClearForm
      </button>
      <div data-testid="watched-phone">{methods.watch('phone')}</div>
    </FormProvider>
  );
};

describe('CustomPhoneField', () => {
  it('handles valid input, leading-zero rejection error, clearing input, and country code switching', async () => {
    renderWithProviders(<FormHarness />);

    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    const input = screen.getByPlaceholderText(
      'Phone number'
    ) as HTMLInputElement;

    // Country code change when displayValue is empty does not set form value
    fireEvent.click(screen.getByTestId('switch-us'));
    expect(screen.getByTestId('selected-code')).toHaveTextContent('+1');
    expect(screen.getByTestId('watched-phone')).toHaveTextContent('');

    // Leading zero shows manual error and does not update displayValue
    fireEvent.change(input, { target: { value: '081234' } });
    await waitFor(() => {
      expect(
        screen.getByText('Phone number cannot start with 0')
      ).toBeInTheDocument();
    });
    expect(input.value).toBe('');

    // Valid input clears error and updates combined value
    fireEvent.change(input, { target: { value: '812345678' } });
    await waitFor(() => {
      expect(
        screen.queryByText('Phone number cannot start with 0')
      ).not.toBeInTheDocument();
    });
    expect(input.value).toBe('812345678');
    expect(screen.getByTestId('watched-phone')).toHaveTextContent(
      '+1812345678'
    );

    // Clearing input resets form value to ''
    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByTestId('watched-phone')).toHaveTextContent('');

    // Typing again then switching country code updates form value
    fireEvent.change(input, { target: { value: '5551234' } });
    fireEvent.click(screen.getByTestId('switch-us'));
    await waitFor(() => {
      expect(screen.getByTestId('watched-phone')).toHaveTextContent(
        '+15551234'
      );
    });
  });

  it('syncs displayValue and detected country code in edit mode and resets when form clears', async () => {
    renderWithProviders(<FormHarness defaultPhone="+62811223344" />);

    const input = screen.getByPlaceholderText(
      'Phone number'
    ) as HTMLInputElement;
    await waitFor(() => {
      expect(input.value).toBe('811223344');
    });
    expect(screen.getByTestId('selected-code')).toHaveTextContent('+62');

    // Change form value externally to Singapore number
    fireEvent.click(screen.getByTestId('set-sg'));
    await waitFor(() => {
      expect(screen.getByTestId('selected-code')).toHaveTextContent('+65');
      expect(input.value).toBe('99887766');
    });

    // Clear external form value
    fireEvent.click(screen.getByTestId('clear-form'));
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
