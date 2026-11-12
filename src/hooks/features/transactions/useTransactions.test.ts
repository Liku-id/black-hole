import { renderHook } from '@testing-library/react';
import useSWR from 'swr';

import { transactionsService } from '@/services';
import { TransactionsFilters, TransactionsResponse } from '@/types/transaction';

import { useTransactions } from './useTransactions';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/services', () => ({
  transactionsService: {
    getEventTransactions: jest.fn()
  }
}));

const mockUseSWR = useSWR as jest.Mock;
const mockGetEventTransactions =
  transactionsService.getEventTransactions as jest.Mock;

describe('useTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls useSWR with filters when eventId is present and maps response', async () => {
    const mockMutate = jest.fn();
    const filters: TransactionsFilters = {
      eventId: 'event-1',
      page: 1,
      show: 10,
      status: 'paid'
    };
    const pagination = {
      page: 1,
      totalPages: 2,
      totalRecords: 20,
      limit: 10,
      hasNext: true,
      hasPrev: false
    };
    const response: TransactionsResponse = {
      statusCode: 200,
      message: 'OK',
      transactions: [{ id: 'tx-1' } as any],
      pagination
    };

    mockGetEventTransactions.mockResolvedValueOnce(response);
    mockUseSWR.mockReturnValue({
      data: response,
      isLoading: false,
      error: undefined,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useTransactions(filters));

    expect(mockUseSWR).toHaveBeenCalledWith(
      ['/api/transactions', filters],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      transactions: response.transactions,
      loading: false,
      error: null,
      mutate: mockMutate,
      pagination
    });

    const fetcher = mockUseSWR.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(response);
    expect(mockGetEventTransactions).toHaveBeenCalledWith(filters);
  });

  it('passes null key when eventId is missing and handles Error, string, and unknown error types', () => {
    const mockMutate = jest.fn();

    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: new Error('Request failed'),
      mutate: mockMutate
    });
    const { result: errResult } = renderHook(() => useTransactions({}));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
    expect(errResult.current).toEqual({
      transactions: [],
      loading: true,
      error: 'Request failed',
      mutate: mockMutate,
      pagination: undefined
    });

    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: 'String error',
      mutate: mockMutate
    });
    const { result: strErrResult } = renderHook(() =>
      useTransactions({ eventId: 'event-1' })
    );
    expect(strErrResult.current.error).toBe('String error');

    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500 },
      mutate: mockMutate
    });
    const { result: objErrResult } = renderHook(() =>
      useTransactions({ eventId: 'event-1' })
    );
    expect(objErrResult.current.error).toBeNull();
  });
});
