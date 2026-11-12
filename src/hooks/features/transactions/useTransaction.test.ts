import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { transactionsService } from '@/services/transactions';

import { useTransaction } from './useTransaction';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/transactions', () => ({
  transactionsService: {
    getTransactionDetails: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetTransactionDetails =
  transactionsService.getTransactionDetails as jest.Mock;

describe('useTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls useApi with polling disabled by default and returns transaction body', async () => {
    const mockMutate = jest.fn();
    const tx = { id: 'tx-1', status: 'paid' };
    mockGetTransactionDetails.mockResolvedValueOnce({ body: tx });
    mockUseApi.mockReturnValue({
      data: { body: tx },
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useTransaction('tx-1'));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/transaction/tx-1', false],
      expect.any(Function),
      {
        refreshInterval: 0,
        revalidateOnFocus: true
      }
    );
    expect(result.current).toEqual({
      transaction: tx,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual({ body: tx });
    expect(mockGetTransactionDetails).toHaveBeenCalledWith('tx-1');
  });

  it('sets refreshInterval to 5000 when polling is true', () => {
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: null,
      mutate: jest.fn()
    });

    const { result } = renderHook(() => useTransaction('tx-1', true));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/transaction/tx-1', true],
      expect.any(Function),
      {
        refreshInterval: 5000,
        revalidateOnFocus: true
      }
    );
    expect(result.current.transaction).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('passes null key when id is null and surfaces errors', () => {
    const mockMutate = jest.fn();
    mockUseApi.mockReturnValue({
      data: null,
      loading: false,
      error: 'Transaction not found',
      mutate: mockMutate
    });

    const { result } = renderHook(() => useTransaction(null));

    expect(mockUseApi).toHaveBeenCalledWith(null, expect.any(Function), {
      refreshInterval: 0,
      revalidateOnFocus: true
    });
    expect(result.current).toEqual({
      transaction: null,
      loading: false,
      error: 'Transaction not found',
      mutate: mockMutate
    });
  });
});
