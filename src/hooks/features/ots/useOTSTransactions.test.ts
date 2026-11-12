import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventsService } from '@/services';

import { useOTSTransactions } from './useOTSTransactions';

jest.mock('@/services', () => ({
  eventsService: {
    getOTSTransactions: jest.fn()
  }
}));

const mockGetOTSTransactions = eventsService.getOTSTransactions as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) =>
  React.createElement(
    SWRConfig,
    {
      value: {
        provider: () => new Map(),
        dedupingInterval: 0,
        shouldRetryOnError: false
      }
    },
    children
  );

describe('useOTSTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not fetch when eventId is empty', () => {
    const { result } = renderHook(() => useOTSTransactions(''), { wrapper });

    expect(mockGetOTSTransactions).not.toHaveBeenCalled();
    expect(result.current.transactions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.pagination).toBeUndefined();
  });

  it('fetches transactions with cashierId and pagination params using response.transactions', async () => {
    const transactions = [{ id: 'tx-1', transactionNumber: 'TRX-1' }];
    const pagination = {
      page: 2,
      limit: 20,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: true
    };
    mockGetOTSTransactions.mockResolvedValue({
      transactions,
      pagination
    });

    const { result } = renderHook(
      () => useOTSTransactions('event-1', 'cashier-1', { page: 2, limit: 20 }),
      { wrapper }
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.transactions).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetOTSTransactions).toHaveBeenCalledWith('event-1', {
      cashier_id: 'cashier-1',
      page: 2,
      limit: 20
    });
    expect(result.current.transactions).toEqual(transactions);
    expect(result.current.pagination).toEqual(pagination);
    expect(result.current.error).toBeUndefined();
  });

  it('supports response.body.data and response.body.pagination format without optional args', async () => {
    const transactions = [{ id: 'tx-2', transactionNumber: 'TRX-2' }];
    const pagination = { page: 1, limit: 10, totalRecords: 1 };
    mockGetOTSTransactions.mockResolvedValue({
      body: {
        data: transactions,
        pagination
      }
    });

    const { result } = renderHook(() => useOTSTransactions('event-1'), {
      wrapper
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetOTSTransactions).toHaveBeenCalledWith('event-1', {
      cashier_id: undefined,
      page: undefined,
      limit: undefined
    });
    expect(result.current.transactions).toEqual(transactions);
    expect(result.current.pagination).toEqual(pagination);
  });

  it('falls back to response.data and empty array when missing', async () => {
    const transactions = [{ id: 'tx-3', transactionNumber: 'TRX-3' }];
    mockGetOTSTransactions.mockResolvedValueOnce({
      data: transactions
    });

    const { result: withData } = renderHook(
      () => useOTSTransactions('event-1'),
      { wrapper }
    );

    await waitFor(() => expect(withData.current.loading).toBe(false));
    expect(withData.current.transactions).toEqual(transactions);
    expect(withData.current.pagination).toBeUndefined();

    mockGetOTSTransactions.mockResolvedValueOnce({});

    const { result: empty } = renderHook(() => useOTSTransactions('event-2'), {
      wrapper
    });

    await waitFor(() => expect(empty.current.loading).toBe(false));
    expect(empty.current.transactions).toEqual([]);
    expect(empty.current.pagination).toBeUndefined();
  });

  it('returns error when getOTSTransactions rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('Transaction fetch failed');
    mockGetOTSTransactions.mockRejectedValue(err);

    const { result } = renderHook(() => useOTSTransactions('event-1'), {
      wrapper
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transactions).toEqual([]);
    expect(result.current.error).toBe(err);
  });
});
