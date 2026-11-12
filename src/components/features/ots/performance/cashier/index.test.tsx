import { fireEvent, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { CashierDetails } from './index';

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

jest.mock('../table', () => ({
  PerformanceTable: ({ eventId, cashierId }: any) => (
    <div data-testid="performance-table">
      {eventId}:{cashierId}
    </div>
  )
}));

describe('CashierDetails', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not render PerformanceTable when cashiers list is empty', () => {
    renderWithProviders(<CashierDetails eventId="event-1" cashiers={[]} />);

    expect(screen.getByText('Cashier Details')).toBeInTheDocument();
    expect(screen.queryByTestId('performance-table')).not.toBeInTheDocument();
  });

  it('auto-selects first cashier and switches tabs on click', () => {
    const cashiers = [
      { user_id: 'c-1', full_name: 'Alice Cashier' },
      { user_id: 'c-2', full_name: 'Bob Cashier' }
    ] as any;

    renderWithProviders(
      <CashierDetails eventId="event-1" cashiers={cashiers} />
    );

    expect(screen.getByTestId('performance-table')).toHaveTextContent(
      'event-1:c-1'
    );

    fireEvent.click(screen.getByText('Bob Cashier'));

    expect(screen.getByTestId('performance-table')).toHaveTextContent(
      'event-1:c-2'
    );
  });

  it('navigates to /team when Add New Cashier button is clicked', () => {
    renderWithProviders(<CashierDetails eventId="event-1" cashiers={[]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add New Cashier' }));
    expect(mockPush).toHaveBeenCalledWith('/team');
  });
});
