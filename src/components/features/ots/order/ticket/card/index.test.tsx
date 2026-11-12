import { fireEvent, screen } from '@testing-library/react';

import { createMockTicketType } from '@/test-utils/factories';
import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { TicketTypeCard } from './index';

describe('TicketTypeCard', () => {
  const mockOnQtyChange = jest.fn();

  const futureDate = new Date(Date.now() + 86400000).toISOString();
  const pastDate = new Date(Date.now() - 86400000).toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ticket details, low stock warning, and handles qty increment/decrement', () => {
    const ticket = createMockTicketType({
      name: 'VIP Pass',
      price: 250000,
      quantity: 10,
      purchased_amount: 6, // remaining = 4 <= 5
      max_order_quantity: 5,
      sales_start_date: pastDate,
      sales_end_date: futureDate
    });

    renderWithProviders(
      <TicketTypeCard
        index={0}
        ticketType={ticket}
        qty={2}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(screen.getAllByText('VIP Pass').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/⚠ low stock/).length).toBeGreaterThan(0);

    const decrementBtn = screen
      .getAllByTestId('RemoveIcon')[0]
      .closest('button')!;
    const incrementBtn = screen.getAllByTestId('AddIcon')[0].closest('button')!;

    expect(decrementBtn).toBeEnabled();
    expect(incrementBtn).toBeEnabled();

    fireEvent.click(decrementBtn);
    expect(mockOnQtyChange).toHaveBeenCalledWith(1);

    fireEvent.click(incrementBtn);
    expect(mockOnQtyChange).toHaveBeenCalledWith(3);
  });

  it('disables decrement at qty 0 and disables increment when qty reaches remaining or maxBuy', () => {
    const ticket = createMockTicketType({
      quantity: 10,
      purchased_amount: 8, // remaining = 2
      max_order_quantity: 5,
      sales_start_date: pastDate,
      sales_end_date: futureDate
    });

    const { rerender } = renderWithProviders(
      <TicketTypeCard
        index={1}
        ticketType={ticket}
        qty={0}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(
      screen.getAllByTestId('RemoveIcon')[0].closest('button')
    ).toBeDisabled();
    expect(screen.getAllByTestId('AddIcon')[0].closest('button')).toBeEnabled();

    rerender(
      <TicketTypeCard
        index={1}
        ticketType={ticket}
        qty={2}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(
      screen.getAllByTestId('AddIcon')[0].closest('button')
    ).toBeDisabled();
    expect(screen.getAllByText(/⚠ low stock/).length).toBeGreaterThan(0);
  });

  it('does not show low stock warning when remaining > 5 or remaining === 0', () => {
    const abundantTicket = createMockTicketType({
      quantity: 20,
      purchased_amount: 5,
      sales_start_date: pastDate,
      sales_end_date: futureDate
    });

    const { rerender } = renderWithProviders(
      <TicketTypeCard
        index={0}
        ticketType={abundantTicket}
        qty={0}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(screen.queryByText(/⚠ low stock/)).not.toBeInTheDocument();

    const emptyStockTicket = createMockTicketType({
      quantity: 10,
      purchased_amount: 10,
      sales_start_date: pastDate,
      sales_end_date: futureDate
    });

    rerender(
      <TicketTypeCard
        index={0}
        ticketType={emptyStockTicket}
        qty={0}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(screen.queryByText(/⚠ low stock/)).not.toBeInTheDocument();
  });

  it('renders AVAILABLE when sales dates are missing', () => {
    const ticket = createMockTicketType({
      sales_start_date: '',
      sales_end_date: ''
    });

    renderWithProviders(
      <TicketTypeCard
        index={0}
        ticketType={ticket}
        qty={0}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(screen.getAllByTestId('AddIcon').length).toBeGreaterThan(0);
  });

  it('renders SOON when current time is before sales_start_date', () => {
    const futureStart = new Date(Date.now() + 86400000).toISOString();
    const futureEnd = new Date(Date.now() + 172800000).toISOString();

    const ticket = createMockTicketType({
      sales_start_date: futureStart,
      sales_end_date: futureEnd
    });

    renderWithProviders(
      <TicketTypeCard
        index={0}
        ticketType={ticket}
        qty={0}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(screen.getAllByText('SOON').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('AddIcon')).not.toBeInTheDocument();
  });

  it('renders SOLD when current time is after sales_end_date', () => {
    const oldStart = new Date(Date.now() - 172800000).toISOString();
    const oldEnd = new Date(Date.now() - 86400000).toISOString();

    const ticket = createMockTicketType({
      sales_start_date: oldStart,
      sales_end_date: oldEnd
    });

    renderWithProviders(
      <TicketTypeCard
        index={0}
        ticketType={ticket}
        qty={0}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(screen.getAllByText('SOLD').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('AddIcon')).not.toBeInTheDocument();
  });

  it('toggles details collapse and formats description line breaks', () => {
    const ticket = createMockTicketType({
      description: 'Line one\n\nParagraph two\nLine three'
    });

    const { rerender } = renderWithProviders(
      <TicketTypeCard
        index={0}
        ticketType={ticket}
        qty={0}
        onQtyChange={mockOnQtyChange}
      />
    );

    expect(screen.getByText('See Details')).toBeInTheDocument();
    fireEvent.click(screen.getByText('See Details'));

    expect(screen.getByText('Hide Details')).toBeInTheDocument();
    expect(screen.getByText(/Line one/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide Details'));
    expect(screen.getByText('See Details')).toBeInTheDocument();

    rerender(
      <TicketTypeCard
        index={0}
        ticketType={createMockTicketType({ description: '' })}
        qty={0}
        onQtyChange={mockOnQtyChange}
      />
    );

    fireEvent.click(screen.getByText('See Details'));
    expect(screen.getByText('Hide Details')).toBeInTheDocument();
  });
});
