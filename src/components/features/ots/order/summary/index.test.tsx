import { fireEvent, screen } from '@testing-library/react';

import { usePaymentMethods } from '@/hooks/list/usePaymentMethods';
import {
  createMockEventDetail,
  createMockTicketType
} from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { OrderSummary } from './index';

jest.mock('@/hooks/list/usePaymentMethods', () => ({
  usePaymentMethods: jest.fn()
}));

const mockUsePaymentMethods = usePaymentMethods as jest.MockedFunction<
  typeof usePaymentMethods
>;

describe('OrderSummary', () => {
  const mockOnCheckout = jest.fn();
  const mockOnPaymentMethodChange = jest.fn();

  const qrisMethod = {
    id: 'qris-1',
    name: 'QRIS',
    type: 'EWALLET',
    logo: '/logo/qris.png',
    bankId: 'bank-1',
    requestType: 'QR',
    paymentCode: 'QRIS',
    paymentMethodFee: 0.7,
    channelProperties: {},
    rules: [],
    bank: {
      id: 'bank-1',
      name: 'QRIS',
      channelCode: 'QRIS',
      channelType: 'QR',
      minAmount: 1000,
      maxAmount: 10000000
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: { qris: [qrisMethod] },
      loading: false,
      error: null
    });
  });

  it('calculates percentage admin fee and PB1 tax and toggles price detail breakdown', () => {
    const items = [
      {
        ticketType: createMockTicketType({ price: 100000 }),
        quantity: 2
      },
      {
        ticketType: createMockTicketType({ id: 'tt-2', price: 50000 }),
        quantity: 0
      }
    ];
    const eventDetail = createMockEventDetail({
      adminFee: 5, // 5% of 200,000 = 10,000
      tax: 10 // 10% of 200,000 = 20,000
    });

    renderWithProviders(
      <OrderSummary
        items={items}
        eventDetail={eventDetail}
        onCheckout={mockOnCheckout}
      />
    );

    expect(screen.getByText('2 Ticket')).toBeInTheDocument();
    // Grand total: 200,000 + 10,000 + 20,000 = 230,000
    expect(screen.getByText(/230\.000/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('See Detail'));
    expect(screen.getByText('Hide Detail')).toBeInTheDocument();
    expect(screen.getByText('Price Detail')).toBeInTheDocument();
    expect(screen.getByText(/200\.000/)).toBeInTheDocument();
    expect(screen.getByText(/10\.000/)).toBeInTheDocument();
    expect(screen.getByText(/20\.000/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide Detail'));
    expect(screen.getByText('See Detail')).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: 'Continue' });
    expect(continueBtn).toBeEnabled();
    fireEvent.click(continueBtn);
    expect(mockOnCheckout).toHaveBeenCalledTimes(1);
  });

  it('calculates fixed admin fee when adminFee > 100 and zero fees when empty', () => {
    const items = [
      {
        ticketType: createMockTicketType({ price: 100000 }),
        quantity: 1
      }
    ];
    const eventDetail = createMockEventDetail({
      adminFee: 5000, // fixed > 100
      tax: 0
    });

    const { rerender } = renderWithProviders(
      <OrderSummary
        items={items}
        eventDetail={eventDetail}
        onCheckout={mockOnCheckout}
      />
    );

    expect(screen.getByText(/105\.000/)).toBeInTheDocument();

    rerender(
      <OrderSummary
        items={[]}
        eventDetail={eventDetail}
        onCheckout={mockOnCheckout}
      />
    );

    expect(screen.getByText('0 Ticket')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('handles showPaymentSelection with percentage QRIS fee and auto-selects QRIS', () => {
    const items = [
      {
        ticketType: createMockTicketType({ price: 100000 }),
        quantity: 1
      }
    ];

    renderWithProviders(
      <OrderSummary
        items={items}
        onCheckout={mockOnCheckout}
        showPaymentSelection={true}
        selectedPaymentId=""
        onPaymentMethodChange={mockOnPaymentMethodChange}
      />
    );

    expect(mockOnPaymentMethodChange).toHaveBeenCalledWith('qris-1', 0.7);
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('QRIS')).toBeInTheDocument();
    // 100,000 + round(100,000 * 0.7 / 100) = 100,700
    expect(screen.getByText(/100\.700/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('handles fixed QRIS fee when paymentMethodFee >= 1 and selectedPaymentId set', () => {
    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: {
        qris: [{ ...qrisMethod, paymentMethodFee: 2500 }]
      },
      loading: false,
      error: null
    });

    const items = [
      {
        ticketType: createMockTicketType({ price: 100000 }),
        quantity: 1
      }
    ];

    renderWithProviders(
      <OrderSummary
        items={items}
        onCheckout={mockOnCheckout}
        showPaymentSelection={true}
        selectedPaymentId="qris-1"
        onPaymentMethodChange={mockOnPaymentMethodChange}
      />
    );

    // Already selected -> useEffect should not auto-fire
    expect(mockOnPaymentMethodChange).not.toHaveBeenCalled();
    // 100,000 + 2,500 = 102,500
    expect(screen.getByText(/102\.500/)).toBeInTheDocument();
  });

  it('disables Continue when loading or paymentMethodsLoading or QRIS missing', () => {
    const items = [
      {
        ticketType: createMockTicketType({ price: 100000 }),
        quantity: 1
      }
    ];

    const { rerender } = renderWithProviders(
      <OrderSummary items={items} onCheckout={mockOnCheckout} loading={true} />
    );
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: {},
      loading: true,
      error: null
    });

    rerender(
      <OrderSummary
        items={items}
        onCheckout={mockOnCheckout}
        showPaymentSelection={true}
      />
    );
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    mockUsePaymentMethods.mockReturnValue({
      paymentMethods: {},
      loading: false,
      error: null
    });

    rerender(
      <OrderSummary
        items={items}
        onCheckout={mockOnCheckout}
        showPaymentSelection={true}
      />
    );
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.queryByText('Payment Method')).not.toBeInTheDocument();
  });
});
