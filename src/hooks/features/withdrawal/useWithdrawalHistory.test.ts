import { renderHook } from '@testing-library/react';

import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { PaginationFilters, withdrawalService } from '@/services/withdrawal';

import { useWithdrawalHistory } from './useWithdrawalHistory';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/withdrawal', () => ({
  withdrawalService: {
    getWithdrawalHistory: jest.fn()
  }
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseApi = useApi as jest.Mock;
const mockGetWithdrawalHistory =
  withdrawalService.getWithdrawalHistory as jest.Mock;

describe('useWithdrawalHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('includes authenticated user id in cache key and returns withdrawals and pagination', async () => {
    const mockMutate = jest.fn();
    const filters: PaginationFilters = {
      page: 1,
      show: 10,
      status: 'approved'
    };
    const pagination = {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
    const item = { id: 'wd-1', status: 'approved', requestedAmount: '500000' };
    const response = {
      statusCode: 200,
      message: 'OK',
      body: {
        data: [item],
        pagination
      }
    };

    mockUseAuth.mockReturnValue({ user: { id: 'user-42' } });
    mockGetWithdrawalHistory.mockResolvedValueOnce(response);
    mockUseApi.mockReturnValue({
      data: response,
      loading: false,
      error: undefined,
      mutate: mockMutate
    });

    const { result } = renderHook(() =>
      useWithdrawalHistory('event-1', 'eo-1', filters)
    );

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/withdrawal/history', 'event-1', 'eo-1', filters, 'user-42'],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      withdrawals: [item],
      loading: false,
      error: null,
      mutate: mockMutate,
      pagination
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(response);
    expect(mockGetWithdrawalHistory).toHaveBeenCalledWith(
      'event-1',
      'eo-1',
      filters
    );
  });

  it('falls back to anonymous userId when user is absent and forwards error and defaults', () => {
    const mockMutate = jest.fn();
    mockUseAuth.mockReturnValue({ user: null });
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'History error',
      mutate: mockMutate
    });

    const { result } = renderHook(() =>
      useWithdrawalHistory(undefined, undefined)
    );

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/withdrawal/history', undefined, undefined, undefined, 'anonymous'],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      withdrawals: [],
      loading: true,
      error: 'History error',
      mutate: mockMutate,
      pagination: undefined
    });
  });
});
