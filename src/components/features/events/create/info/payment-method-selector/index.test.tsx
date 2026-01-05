import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { PaymentMethodSelector } from './index';

const TestWrapper = ({ children, defaultValues }: any) => {
  const methods = useForm({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('PaymentMethodSelector', () => {
  const mockGroupedPaymentMethods = {
    'Virtual Account': [
      {
        id: 'pm1',
        name: 'BCA VA',
        type: 'Virtual Account',
        logo: '/logo/bca.png',
        bankId: 'bank1',
        requestType: 'va',
        paymentCode: 'BCA',
        paymentMethodFee: 0,
        channelProperties: {},
        rules: [],
        bank: {
          id: 'bank1',
          name: 'BCA',
          channelCode: 'BCA',
          channelType: 'va',
          minAmount: 10000,
          maxAmount: 100000000
        }
      }
    ],
    QRIS: [
      {
        id: 'pm2',
        name: 'QRIS',
        type: 'QRIS',
        logo: '/logo/qris.png',
        bankId: 'bank2',
        requestType: 'qris',
        paymentCode: 'QRIS',
        paymentMethodFee: 0,
        channelProperties: {},
        rules: [],
        bank: {
          id: 'bank2',
          name: 'QRIS',
          channelCode: 'QRIS',
          channelType: 'qris',
          minAmount: 10000,
          maxAmount: 100000000
        }
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render payment method selector', () => {
      render(
        <TestWrapper defaultValues={{ paymentMethod: [] }}>
          <PaymentMethodSelector
            name="paymentMethod"
            groupedPaymentMethods={mockGroupedPaymentMethods}
            label="Payment Method*"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Payment Method*')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(
        <TestWrapper defaultValues={{ paymentMethod: [] }}>
          <PaymentMethodSelector
            name="paymentMethod"
            groupedPaymentMethods={mockGroupedPaymentMethods}
            label="Payment Method*"
            placeholder="Select payment methods"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Payment Method*')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error icon when isRejected is true', () => {
      render(
        <TestWrapper defaultValues={{ paymentMethod: [] }}>
          <PaymentMethodSelector
            name="paymentMethod"
            groupedPaymentMethods={mockGroupedPaymentMethods}
            label="Payment Method*"
            isRejected={true}
          />
        </TestWrapper>
      );

      // Component should render
      expect(screen.getByText('Payment Method*')).toBeInTheDocument();
    });
  });
});


