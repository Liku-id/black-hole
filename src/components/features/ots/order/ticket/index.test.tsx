import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useAtom } from 'jotai';

import { useToast } from '@/contexts/ToastContext';
import { ordersService } from '@/services/orders';
import {
  createMockEventDetail,
  createMockTicketType
} from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { TicketSellingSection } from './index';

jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai');
  return {
    ...actual,
    useAtom: jest.fn()
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
    createOrder: jest.fn()
  }
}));

jest.mock('../summary', () => ({
  OrderSummary: ({ items, loading, onCheckout }: any) => (
    <div data-testid="order-summary">
      <span>items:{items.length}</span>
      <span>loading:{String(Boolean(loading))}</span>
      <button onClick={onCheckout}>Continue</button>
    </div>
  )
}));

const mockUseAtom = useAtom as jest.MockedFunction<typeof useAtom>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockCreateOrder = ordersService.createOrder as jest.MockedFunction<
  typeof ordersService.createOrder
>;

describe('TicketSellingSection', () => {
  const mockShowInfo = jest.fn();
  const mockShowError = jest.fn();
  const mockSetActiveOrder = jest.fn();

  const pastDate = new Date(Date.now() - 86400000).toISOString();
  const futureDate = new Date(Date.now() + 86400000).toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
    (mockUseAtom as any).mockReturnValue([null, mockSetActiveOrder]);
    mockUseToast.mockReturnValue({
      showInfo: mockShowInfo,
      showError: mockShowError,
      showToast: jest.fn()
    } as any);
  });

  it('renders loading state when isLoading is true', () => {
    renderWithProviders(
      <TicketSellingSection
        tickets={[]}
        eventDetail={createMockEventDetail()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading tickets...')).toBeInTheDocument();
    expect(screen.getByText('loading:true')).toBeInTheDocument();
  });

  it('renders empty state when tickets array is empty', () => {
    renderWithProviders(
      <TicketSellingSection
        tickets={[]}
        eventDetail={createMockEventDetail()}
        isLoading={false}
      />
    );

    expect(
      screen.getByText('No ticket types found for this event.')
    ).toBeInTheDocument();
  });

  it('shows error if Continue is clicked with no selected ticket', () => {
    const tickets = [
      createMockTicketType({
        id: 'tt-1',
        sales_start_date: pastDate,
        sales_end_date: futureDate
      })
    ];

    renderWithProviders(
      <TicketSellingSection
        tickets={tickets}
        eventDetail={createMockEventDetail()}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockShowError).toHaveBeenCalledWith(
      'Please select at least one ticket.'
    );
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it('creates order for regular ticket and updates activeOrder atom on success', async () => {
    mockCreateOrder.mockResolvedValue({
      statusCode: 0,
      message: 'OK',
      order: { id: 'order-1', expiredAt: '2026-12-01T00:00:00.000Z' }
    });

    const tickets = [
      createMockTicketType({
        id: 'tt-1',
        name: 'Regular',
        sales_start_date: pastDate,
        sales_end_date: futureDate
      }),
      createMockTicketType({
        id: 'tt-2',
        name: 'VIP',
        sales_start_date: pastDate,
        sales_end_date: futureDate
      })
    ];

    renderWithProviders(
      <TicketSellingSection
        tickets={tickets}
        eventDetail={createMockEventDetail()}
        isLoading={false}
      />
    );

    const addButtons = screen.getAllByTestId('AddIcon');
    fireEvent.click(addButtons[0].closest('button')!);
    expect(screen.getByText('items:1')).toBeInTheDocument();

    // Decrement back to 0 clears selection
    const removeButtons = screen.getAllByTestId('RemoveIcon');
    fireEvent.click(removeButtons[0].closest('button')!);
    expect(screen.getByText('items:0')).toBeInTheDocument();

    // Select again
    fireEvent.click(addButtons[0].closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith({
        tickets: [{ id: 'tt-1', groupTicketId: null, quantity: 1 }]
      });
      expect(mockShowInfo).toHaveBeenCalledWith('Order created successfully!');
      expect(mockSetActiveOrder).toHaveBeenCalledWith({
        id: 'order-1',
        expiredAt: '2026-12-01T00:00:00.000Z'
      });
    });
  });

  it('creates order for group ticket using ticket_type_id and group_ticket_id', async () => {
    mockCreateOrder.mockResolvedValue({
      statusCode: 0,
      message: 'OK',
      order: { id: 'order-2', expiredAt: '2026-12-01T00:00:00.000Z' }
    });

    const groupTicket = {
      ...createMockTicketType({
        id: 'gt-1',
        sales_start_date: pastDate,
        sales_end_date: futureDate
      }),
      group_ticket_id: 'group-99',
      ticket_type_id: 'tt-base'
    };

    renderWithProviders(
      <TicketSellingSection
        tickets={[groupTicket]}
        eventDetail={createMockEventDetail()}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getAllByTestId('AddIcon')[0].closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith({
        tickets: [
          {
            id: 'tt-base',
            groupTicketId: 'group-99',
            quantity: 1
          }
        ]
      });
    });
  });

  it('shows error toast when createOrder returns non-zero statusCode', async () => {
    mockCreateOrder
      .mockResolvedValueOnce({
        statusCode: 400,
        message: 'Insufficient stock',
        order: { id: '', expiredAt: '' }
      })
      .mockResolvedValueOnce({
        statusCode: 500,
        message: '',
        order: { id: '', expiredAt: '' }
      });

    const tickets = [
      createMockTicketType({
        id: 'tt-1',
        sales_start_date: pastDate,
        sales_end_date: futureDate
      })
    ];

    renderWithProviders(
      <TicketSellingSection
        tickets={tickets}
        eventDetail={createMockEventDetail()}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getAllByTestId('AddIcon')[0].closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Insufficient stock');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to create order');
    });
  });

  it('shows error toast when createOrder throws', async () => {
    mockCreateOrder
      .mockRejectedValueOnce(new Error('Server down'))
      .mockRejectedValueOnce({});

    const tickets = [
      createMockTicketType({
        id: 'tt-1',
        sales_start_date: pastDate,
        sales_end_date: futureDate
      })
    ];

    renderWithProviders(
      <TicketSellingSection
        tickets={tickets}
        eventDetail={createMockEventDetail()}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getAllByTestId('AddIcon')[0].closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Server down');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Failed to create order');
    });
  });
});
