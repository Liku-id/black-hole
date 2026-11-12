import { renderHook } from '@testing-library/react';
import useSWR from 'swr';

import {
  PaginationFilters,
  WithdrawalSummariesResponse,
  withdrawalService
} from '@/services/withdrawal';

import { useWithdrawalSummaries } from './useWithdrawalSummaries';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/services/withdrawal', () => ({
  withdrawalService: {
    getSummaries: jest.fn()
  }
}));

const mockUseSWR = useSWR as jest.Mock;
const mockGetSummaries = withdrawalService.getSummaries as jest.Mock;

describe('useWithdrawalSummaries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls useSWR with filters and returns summaries and pagination', async () => {
    const mockMutate = jest.fn();
    const filters: PaginationFilters = { page: 1, show: 10 };
    const pagination = {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
    const summaryItem = { eventId: 'event-1', eventName: 'Wukong Fest' };
    const response: WithdrawalSummariesResponse = {
      statusCode: 200,
      message: 'OK',
      body: {
        data: [summaryItem as any],
        pagination
      }
    };

    mockGetSummaries.mockResolvedValueOnce(response);
    mockUseSWR.mockReturnValue({
      data: response,
      isLoading: false,
      error: undefined,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useWithdrawalSummaries(filters));

    expect(mockUseSWR).toHaveBeenCalledWith(
      ['/api/withdrawal/summary', filters],
      expect.any(Function),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: true
      }
    );
    expect(result.current).toEqual({
      summaries: [summaryItem],
      loading: false,
      error: null,
      mutate: mockMutate,
      pagination
    });

    const fetcher = mockUseSWR.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(response);
    expect(mockGetSummaries).toHaveBeenCalledWith(filters);
  });

  it('returns empty defaults and error message when loading or failed', () => {
    const mockMutate = jest.fn();
    const filters: PaginationFilters = { page: 2, show: 20, status: 'pending' };
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: new Error('Summaries unavailable'),
      mutate: mockMutate
    });

    const { result } = renderHook(() => useWithdrawalSummaries(filters));

    expect(result.current).toEqual({
      summaries: [],
      loading: true,
      error: 'Summaries unavailable',
      mutate: mockMutate,
      pagination: null
    });
  });
});
