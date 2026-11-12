import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/router';

import { useToast } from '@/contexts/ToastContext';
import { ordersService } from '@/services/orders';
import { createMockEventDetail } from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { OrderDetailStep } from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai');
  return {
    ...actual,
    useSetAtom: jest.fn()
  };
});

jest.mock('@/contexts/ToastContext', () => {
  const actual = jest.requireActual('@/contexts/ToastContext');
  return {
    ...actual,
    useToast: jest.fn()
  };
});

jest.mock('@/services/orders', () => ({
  ordersService: {
    getOrder: jest.fn(),
    checkoutOrder: jest.fn()
  }
}));

jest.mock('@/components/features/ots/order/summary', () => ({
  OrderSummary: ({
    items,
    onCheckout,
    loading,
    selectedPaymentId,
    onPaymentMethodChange
  }: any) => (
    <div data-testid="order-summary">
      <span>summary-items:{items.length}</span>
      <span>selected-payment:{selectedPaymentId}</span>
      <span>submitting:{String(Boolean(loading))}</span>
      <button onClick={() => onPaymentMethodChange('qris-1')}>
        Select QRIS
      </button>
      <button onClick={() => onPaymentMethodChange('')}>Clear Payment</button>
      <button onClick={onCheckout}>Continue</button>
    </div>
  )
}));

const mockUseSetAtom = useSetAtom as jest.MockedFunction<typeof useSetAtom>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockGetOrder = ordersService.getOrder as jest.MockedFunction<
  typeof ordersService.getOrder
>;
const mockCheckoutOrder = ordersService.checkoutOrder as jest.MockedFunction<
  typeof ordersService.checkoutOrder
>;

describe('OrderDetailStep', () => {
  const mockPush = jest.fn();
  const mockSetActiveOrder = jest.fn();
  const mockShowInfo = jest.fn();
  const mockShowError = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    mockUseSetAtom.mockReturnValue(mockSetActiveOrder);
    mockUseToast.mockReturnValue({
      showInfo: mockShowInfo,
      showError: mockShowError,
      showToast: jest.fn()
    } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const fillValidForm = () => {
    fireEvent.change(screen.getByPlaceholderText('Enter full name'), {
      target: { value: 'John Attendee' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter email address'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Phone number'), {
      target: { value: '81234567890' }
    });
  };

  it('fetches order details on mount, maps tickets, and supports back navigation', async () => {
    mockGetOrder.mockResolvedValue({
      statusCode: 200,
      message: 'OK',
      event_name: 'Order Event Name',
      tickets: [{ price: 100000, count: 2 }]
    });

    const futureExpiry = new Date(Date.now() + 90000).toISOString();

    renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: futureExpiry }}
        onBack={mockOnBack}
        eventDetail={createMockEventDetail()}
      />
    );

    expect(screen.getByText('Loading Order Details...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });

    expect(mockGetOrder).toHaveBeenCalledWith('order-1');
    expect(screen.getByText('Order Event Name')).toBeInTheDocument();
    expect(screen.getByText('summary-items:1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Back To Ticket Selling'));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders eventName prop over orderData.event_name and falls back to Event Name', async () => {
    mockGetOrder.mockResolvedValue({
      statusCode: 200,
      message: 'OK'
    });

    const { rerender } = renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: '' }}
        onBack={mockOnBack}
        eventName="Custom Event Title"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });
    expect(screen.getByText('Custom Event Title')).toBeInTheDocument();
    expect(screen.getByText('summary-items:0')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();

    rerender(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: '' }}
        onBack={mockOnBack}
      />
    );
    expect(screen.getByText('Event Name')).toBeInTheDocument();
  });

  it('handles getOrder fetch failure gracefully', async () => {
    mockGetOrder.mockRejectedValue(new Error('Fetch failed'));

    renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: '' }}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('handles expired timer immediately and on countdown completion', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-01T10:00:00.000Z'));

    mockGetOrder.mockResolvedValue({
      statusCode: 200,
      message: 'OK',
      tickets: []
    });

    const pastExpiry = new Date('2026-08-01T09:59:00.000Z').toISOString();

    const { unmount } = renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: pastExpiry }}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Timeout')).toBeInTheDocument();
    });
    expect(mockOnBack).toHaveBeenCalledTimes(1);
    unmount();

    mockOnBack.mockClear();
    const soonExpiry = new Date('2026-08-01T10:00:03.000Z').toISOString();

    renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-2', expiredAt: soonExpiry }}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });

    expect(screen.getByText('00:03')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('Timeout')).toBeInTheDocument();
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('shows error if submitted without selecting payment method', async () => {
    mockGetOrder.mockResolvedValue({
      statusCode: 200,
      message: 'OK',
      tickets: []
    });

    renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: '' }}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Please select a payment method'
      );
    });
    expect(mockCheckoutOrder).not.toHaveBeenCalled();
  });

  it('submits checkout successfully with transaction id and navigates to payment page', async () => {
    mockGetOrder.mockResolvedValue({
      statusCode: 200,
      message: 'OK',
      tickets: [{ price: 50000, count: 1 }]
    });
    mockCheckoutOrder.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      transaction: { id: 'tx-123' }
    });

    renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: '' }}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Select QRIS' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockCheckoutOrder).toHaveBeenCalledWith({
        orderId: 'order-1',
        paymentMethodId: 'qris-1',
        attendee: [],
        contactDetails: {
          name: 'John Attendee',
          email: 'john@example.com',
          phone: '+6281234567890'
        }
      });
      expect(mockShowInfo).toHaveBeenCalledWith(
        'Checkout processed successfully!'
      );
      expect(mockSetActiveOrder).toHaveBeenCalledWith(null);
      expect(mockPush).toHaveBeenCalledWith('/ots/checkout-payment/tx-123');
    });
  });

  it('calls onSuccess or onBack when checkout succeeds without transaction id', async () => {
    mockGetOrder.mockResolvedValue({
      statusCode: 200,
      message: 'OK',
      tickets: []
    });
    mockCheckoutOrder.mockResolvedValue({
      statusCode: 0,
      message: 'Success'
    });

    const { rerender } = renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: '' }}
        onBack={mockOnBack}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Select QRIS' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('order-1');
    });

    rerender(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: '' }}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  it('handles checkout non-success response and thrown errors', async () => {
    mockGetOrder.mockResolvedValue({
      statusCode: 200,
      message: 'OK',
      tickets: []
    });
    mockCheckoutOrder
      .mockResolvedValueOnce({ statusCode: 400, message: 'Bad request' })
      .mockResolvedValueOnce({ statusCode: 500, message: '' })
      .mockRejectedValueOnce(new Error('Network down'))
      .mockRejectedValueOnce({});

    renderWithProviders(
      <OrderDetailStep
        activeOrder={{ id: 'order-1', expiredAt: '' }}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-summary')).toBeInTheDocument();
    });

    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Select QRIS' }));

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Bad request');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to process checkout');
    });

    mockShowError.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Network down');
    });

    mockShowError.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to process checkout');
    });
  });
});
