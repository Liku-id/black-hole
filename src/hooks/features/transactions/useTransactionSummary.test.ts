import { renderHook } from '@testing-library/react';
import useSWR from 'swr';

import { transactionsService } from '@/services';
import { TransactionSummary } from '@/types/transaction';

import { useTransactionSummary } from './useTransactionSummary';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/services', () => ({
  transactionsService: {
    getTransactionSummary: jest.fn()
  }
}));

const mockUseSWR = useSWR as jest.Mock;
const mockGetTransactionSummary =
  transactionsService.getTransactionSummary as jest.Mock;

describe('useTransactionSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls useSWR with summary key and returns summary data', async () => {
    const summary: TransactionSummary = {
      ticketSales: { total: 50, amount: 5000000 },
      payment: 5000000,
      withdrawal: 2000000,
      balance: 3000000
    };
    mockGetTransactionSummary.mockResolvedValueOnce(summary);
    mockUseSWR.mockReturnValue({
      data: summary,
      isLoading: false,
      error: undefined
    });

    const { result } = renderHook(() => useTransactionSummary('event-1'));

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/transactions/event-1/summary',
      expect.any(Function)
    );
    expect(result.current).toEqual({
      summary,
      loading: false,
      error: undefined
    });

    const fetcher = mockUseSWR.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(summary);
    expect(mockGetTransactionSummary).toHaveBeenCalledWith('event-1');
  });

  it('passes null key when eventId is empty and handles loading/error states', () => {
    const mockError = new Error('Summary failed');
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: mockError
    });

    const { result } = renderHook(() => useTransactionSummary(''));

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current).toEqual({
      summary: null,
      loading: true,
      error: mockError
    });
  });
});
