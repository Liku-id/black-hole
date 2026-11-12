import { fireEvent, screen } from '@testing-library/react';

import { useOTSTransactions } from '@/hooks';
import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { PerformanceTable } from './index';

jest.mock('@/hooks', () => ({
  useOTSTransactions: jest.fn()
}));

const mockEventTransactionTable = jest.fn();
jest.mock('../../../finance/transaction/event-table', () => ({
  EventTransactionTable: (props: any) => {
    mockEventTransactionTable(props);
    return (
      <div data-testid="event-transaction-table">
        <span>{props.error || 'no-error'}</span>
        <span>total:{props.total}</span>
        <span>page:{props.currentPage}</span>
        <button onClick={() => props.onPageChange(2)}>Next Page</button>
      </div>
    );
  }
}));

const mockUseOTSTransactions = useOTSTransactions as jest.MockedFunction<
  typeof useOTSTransactions
>;

describe('PerformanceTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes hook data and pagination to EventTransactionTable', () => {
    const transactions = [{ id: 'tx-1' }] as any;
    mockUseOTSTransactions.mockReturnValue({
      transactions,
      loading: false,
      pagination: { totalRecords: 25 } as any,
      error: null,
      mutate: jest.fn()
    } as any);

    renderWithProviders(
      <PerformanceTable eventId="event-1" cashierId="cashier-1" />
    );

    expect(mockUseOTSTransactions).toHaveBeenCalledWith(
      'event-1',
      'cashier-1',
      { page: 0, limit: 10 }
    );
    expect(screen.getByText('no-error')).toBeInTheDocument();
    expect(screen.getByText('total:25')).toBeInTheDocument();
    expect(screen.getByText('page:0')).toBeInTheDocument();
    expect(mockEventTransactionTable).toHaveBeenCalledWith(
      expect.objectContaining({
        transactions,
        loading: false,
        error: undefined,
        total: 25,
        currentPage: 0,
        pageSize: 10
      })
    );
  });

  it('handles error and missing pagination and updates currentPage on page change', () => {
    mockUseOTSTransactions.mockReturnValue({
      transactions: [],
      loading: true,
      pagination: undefined as any,
      error: new Error('Fetch failed'),
      mutate: jest.fn()
    } as any);

    renderWithProviders(<PerformanceTable eventId="event-2" />);

    expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    expect(screen.getByText('total:0')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }));

    expect(mockUseOTSTransactions).toHaveBeenLastCalledWith(
      'event-2',
      undefined,
      { page: 2, limit: 10 }
    );
  });
});
