import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { PaymentMethodSelector } from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

const makePaymentMethod = (overrides: Record<string, any> = {}) => ({
  id: 'pm-default',
  name: 'Default Method',
  type: 'va',
  logo: '/logo/default.png',
  bankId: 'bank-1',
  requestType: 'VA',
  paymentCode: 'BCA_VIRTUAL_ACCOUNT',
  paymentMethodFee: 0,
  channelProperties: {},
  rules: [],
  bank: {
    id: 'bank-1',
    name: 'Bank BCA',
    channelCode: 'BCA',
    channelType: 'VIRTUAL_ACCOUNT',
    minAmount: 10000,
    maxAmount: 100000000
  },
  ...overrides
});

const groupedPaymentMethods = {
  'Virtual Account': [
    makePaymentMethod({
      id: 'va-bca',
      name: 'BCA Virtual Account',
      type: 'va',
      logo: '/logo/bca.png',
      paymentCode: 'BCA_VIRTUAL_ACCOUNT',
      bank: {
        id: 'bank-bca',
        name: 'Bank BCA',
        channelCode: 'BCA',
        channelType: 'VIRTUAL_ACCOUNT',
        minAmount: 10000,
        maxAmount: 100000000
      }
    }),
    makePaymentMethod({
      id: 'va-bsi',
      name: 'BSI Virtual Account',
      type: 'va',
      logo: '/logo/bsi.png',
      paymentCode: 'BSI_VIRTUAL_ACCOUNT',
      bank: {
        id: 'bank-bsi',
        name: 'Bank BSI',
        channelCode: 'BSI',
        channelType: 'VIRTUAL_ACCOUNT',
        minAmount: 10000,
        maxAmount: 100000000
      }
    })
  ],
  QRIS: [
    makePaymentMethod({
      id: 'qris-1',
      name: 'QRIS',
      type: 'qris',
      logo: '/logo/qris.png',
      paymentCode: 'QRIS',
      bank: null
    })
  ],
  Free: [
    makePaymentMethod({
      id: 'free-1',
      name: 'Free Event',
      type: 'free',
      logo: '/logo/free.png',
      paymentCode: 'FREE',
      bank: null
    })
  ],
  'Payment Link': [
    makePaymentMethod({
      id: 'pl-1',
      name: 'Payment Link',
      type: 'payment_link',
      logo: '',
      paymentCode: 'PAYMENT_LINK',
      bank: null
    })
  ],
  Card: [
    makePaymentMethod({
      id: 'card-1',
      name: 'Credit Card',
      type: 'card',
      logo: '/logo/card.png',
      paymentCode: 'CREDIT_CARD',
      bank: null
    })
  ],
  'E-Wallet': [
    makePaymentMethod({
      id: 'ewallet-1',
      name: 'OVO',
      type: 'ewallet',
      logo: '/logo/ovo.png',
      paymentCode: 'OVO',
      bank: {
        id: 'bank-ovo',
        name: 'OVO',
        channelCode: 'OVO',
        channelType: 'EWALLET',
        minAmount: 1000,
        maxAmount: 10000000
      }
    })
  ],
  Retail: [
    makePaymentMethod({
      id: 'retail-1',
      name: 'Alfamart',
      type: 'retail',
      logo: '/logo/alfa.png',
      paymentCode: 'ALFAMART',
      bank: null
    })
  ],
  PayLater: [
    makePaymentMethod({
      id: 'paylater-1',
      name: 'Kredivo',
      type: 'paylater',
      logo: '/logo/kredivo.png',
      paymentCode: 'KREDIVO',
      bank: null
    })
  ],
  Misc: [
    makePaymentMethod({
      id: 'other-1',
      name: 'Direct Debit',
      type: 'direct_debit',
      logo: '/logo/dd.png',
      paymentCode: 'DD_BRI',
      bank: null
    })
  ]
};

interface TestFormProps {
  defaultValues?: Record<string, any>;
  rules?: Record<string, any>;
  disabled?: boolean;
  isRejected?: boolean;
  label?: string;
}

const TestWrapper = ({
  defaultValues = { paymentMethod: [] },
  rules,
  disabled = false,
  isRejected = false,
  label = 'Payment Method*'
}: TestFormProps) => {
  const methods = useForm({ defaultValues });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <PaymentMethodSelector
          id="payment-method-input"
          label={label}
          name="paymentMethod"
          placeholder="Select payment methods"
          rules={rules}
          groupedPaymentMethods={groupedPaymentMethods as any}
          disabled={disabled}
          isRejected={isRejected}
          fullWidth
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('PaymentMethodSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without label, displays error icon when rejected, and shows validation error', async () => {
    const { rerender } = render(<TestWrapper label="" isRejected={false} />);

    expect(screen.queryByText('Payment Method*')).not.toBeInTheDocument();

    rerender(
      <TestWrapper
        label="Payment Method*"
        isRejected={true}
        rules={{ required: 'Payment method is required' }}
      />
    );

    expect(screen.getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(
        screen.getByText('Payment method is required')
      ).toBeInTheDocument();
    });
  });

  it('does not open modal when disabled and displays selected option strings accurately', () => {
    const { rerender } = render(
      <TestWrapper
        key="va-qris-free"
        defaultValues={{ paymentMethod: ['va-bca', 'qris-1', 'free-1'] }}
        disabled={true}
      />
    );

    const input = screen.getByPlaceholderText('Select payment methods');
    expect(input).toHaveValue('BCA, QRIS, Free Event');

    fireEvent.click(input);
    expect(
      screen.queryByText('Payment Method Selection')
    ).not.toBeInTheDocument();

    rerender(
      <TestWrapper
        key="payment-link"
        defaultValues={{ paymentMethod: ['pl-1', 'card-1'] }}
      />
    );
    expect(screen.getByPlaceholderText('Select payment methods')).toHaveValue(
      'Payment Link'
    );
  });

  it('opens modal with empty selection, selects VA & QRIS, handles Done button and chip removal', () => {
    render(<TestWrapper defaultValues={{ paymentMethod: [] }} />);

    fireEvent.click(screen.getByPlaceholderText('Select payment methods'));
    expect(screen.getByText('Payment Method Selection')).toBeInTheDocument();
    expect(
      screen.getByText('No payment methods selected yet.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Done')).not.toBeInTheDocument();

    // Open Virtual Account accordion & select BCA
    fireEvent.click(document.getElementById('va_payment_method')!);
    expect(screen.queryByText('Bank BSI')).not.toBeInTheDocument();
    fireEvent.click(
      document.getElementById('bca_payment_method_checkbox') as HTMLElement
    );

    expect(screen.getByText('Selected Payment Methods:')).toBeInTheDocument();
    expect(screen.getAllByText('Bank BCA').length).toBeGreaterThan(0);
    expect(screen.getByText('Done')).toBeInTheDocument();

    // Select QRIS & Free
    fireEvent.click(document.getElementById('qris_payment_method')!);
    fireEvent.click(
      document.getElementById('qris_payment_method_checkbox') as HTMLElement
    );
    fireEvent.click(document.getElementById('free_payment_method')!);
    fireEvent.click(
      document.getElementById(
        'free_event_payment_method_checkbox'
      ) as HTMLElement
    );

    // Trigger image onError on selected chip logo to cover LogoImage fallback
    const bcaLogo = screen.getAllByAltText('BCA Virtual Account')[0];
    fireEvent.error(bcaLogo);

    // Uncheck QRIS via checkbox
    fireEvent.click(
      document.getElementById('qris_payment_method_checkbox') as HTMLElement
    );

    // Remove BCA chip via × button
    fireEvent.click(screen.getAllByText('×')[0]);

    // Click Done to close modal
    fireEvent.click(screen.getByText('Done'));
    expect(
      screen.queryByText('Payment Method Selection')
    ).not.toBeInTheDocument();
  });

  it('enables Payment Link, disables when VA/QRIS selected, manages categorized sub-methods, and clears sub-methods on disable', () => {
    render(
      <TestWrapper defaultValues={{ paymentMethod: ['va-bca', 'qris-1'] }} />
    );

    fireEvent.click(screen.getByPlaceholderText('Select payment methods'));

    const plSwitchInput = document
      .getElementById('payment_link_payment_method')!
      .querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(plSwitchInput).toBeDisabled();

    // Remove VA & QRIS via chips so Payment Link becomes enabled
    fireEvent.click(screen.getAllByText('×')[0]);
    fireEvent.click(screen.getAllByText('×')[0]);
    expect(plSwitchInput).not.toBeDisabled();

    // Expand Payment Link accordion & toggle switch on
    fireEvent.click(document.getElementById('payment_link_payment_method')!);
    fireEvent.click(plSwitchInput);
    expect(
      screen.getByText(
        'All payment methods will be enabled in Xendit Checkout.'
      )
    ).toBeInTheDocument();

    // Categorized sub-methods render
    expect(screen.getByText('Credit/Debit Card')).toBeInTheDocument();
    expect(screen.getByText('E-Wallet')).toBeInTheDocument();
    expect(screen.getByText('Retail Outlets')).toBeInTheDocument();
    expect(screen.getByText('PayLater')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();

    const cardSub = document.getElementById(
      'sub_credit_card_payment_method_checkbox'
    ) as HTMLElement;
    const ovoSub = document.getElementById(
      'sub_ovo_payment_method_checkbox'
    ) as HTMLElement;
    fireEvent.click(cardSub);
    fireEvent.click(ovoSub);

    // Remove card sub-method via chip × button
    fireEvent.click(screen.getAllByText('×')[0]);

    // Uncheck OVO sub-method via checkbox
    fireEvent.click(ovoSub);

    // Check card sub-method then disable Payment Link switch to clear all sub-methods
    fireEvent.click(cardSub);
    fireEvent.click(plSwitchInput);
    expect(
      screen.getByText('No payment methods selected yet.')
    ).toBeInTheDocument();
  });

  it('hides Done button when selection matches initial in different order and closes modal via close button', () => {
    render(
      <TestWrapper defaultValues={{ paymentMethod: ['va-bca', 'free-1'] }} />
    );

    fireEvent.click(screen.getByPlaceholderText('Select payment methods'));
    expect(screen.queryByText('Done')).not.toBeInTheDocument();

    // Remove Free then re-add -> matches initial -> Done hidden
    fireEvent.click(screen.getAllByText('×')[1]);
    expect(screen.getByText('Done')).toBeInTheDocument();

    fireEvent.click(document.getElementById('free_payment_method')!);
    fireEvent.click(
      document.getElementById(
        'free_event_payment_method_checkbox'
      ) as HTMLElement
    );
    expect(screen.queryByText('Done')).not.toBeInTheDocument();

    // Swap one ID with same length to verify sorted diff triggers Done
    fireEvent.click(screen.getAllByText('×')[1]);
    fireEvent.click(document.getElementById('qris_payment_method')!);
    fireEvent.click(
      document.getElementById('qris_payment_method_checkbox') as HTMLElement
    );
    expect(screen.getByText('Done')).toBeInTheDocument();

    // Close accordion and close modal via aria-label="Close" button
    fireEvent.click(document.getElementById('qris_payment_method')!);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.queryByText('Payment Method Selection')
    ).not.toBeInTheDocument();
  });

  it('displays Payment Link chips including non-in-system sub-methods and bank sub-methods', () => {
    render(
      <TestWrapper
        defaultValues={{ paymentMethod: ['pl-1', 'va-bsi', 'card-1'] }}
      />
    );

    fireEvent.click(screen.getByPlaceholderText('Select payment methods'));
    expect(
      screen.getByText('Payment Link (Redirect to Xendit Checkout)')
    ).toBeInTheDocument();
    expect(screen.getAllByText('BSI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Credit Card').length).toBeGreaterThan(0);
  });
});
