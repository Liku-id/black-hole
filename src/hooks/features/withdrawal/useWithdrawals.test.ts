import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { withdrawalService } from '@/services/withdrawal';

import { useWithdrawals } from './useWithdrawals';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/withdrawal', () => ({
  withdrawalService: {
    getWithdrawals: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetWithdrawals = withdrawalService.getWithdrawals as jest.Mock;

describe('useWithdrawals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches withdrawals with params and returns data and pagination', async () => {
    const mockMutate = jest.fn();
    const params = { status: 'pending', show: 20, page: 2 };
    const pagination = {
      page: 2,
      limit: 20,
      totalRecords: 25,
      totalPages: 2,
      hasNext: false,
      hasPrev: true
    };
    const item = { id: 'wd-1', status: 'pending', requestedAmount: '250000' };
    const response = {
      statusCode: 200,
      message: 'OK',
      body: {
        data: [item],
        pagination
      }
    };

    mockGetWithdrawals.mockResolvedValueOnce(response);
    mockUseApi.mockReturnValue({
      data: response,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useWithdrawals(params));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/withdrawal', params],
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
    expect(mockGetWithdrawals).toHaveBeenCalledWith(params);
  });

  it('supports omitted params and returns empty array and error state when data is missing', async () => {
    const mockMutate = jest.fn();
    mockGetWithdrawals.mockResolvedValueOnce({
      statusCode: 200,
      message: 'OK',
      body: { data: [], pagination: undefined }
    });
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Withdrawals error',
      mutate: mockMutate
    });

    const { result } = renderHook(() => useWithdrawals());

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/withdrawal', undefined],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      withdrawals: [],
      loading: true,
      error: 'Withdrawals error',
      mutate: mockMutate,
      pagination: undefined
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await fetcher();
    expect(mockGetWithdrawals).toHaveBeenCalledWith(undefined);
  });
});
