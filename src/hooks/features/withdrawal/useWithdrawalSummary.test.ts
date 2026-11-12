import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { withdrawalService } from '@/services';

import { useWithdrawalSummary } from './useWithdrawalSummary';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services', () => ({
  withdrawalService: {
    getSummaryByEventId: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetSummaryByEventId =
  withdrawalService.getSummaryByEventId as jest.Mock;

describe('useWithdrawalSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches withdrawal summary when eventId is non-empty', async () => {
    const mockMutate = jest.fn();
    const summaryBody = {
      eventId: 'event-1',
      eventName: 'Wukong Fest',
      availableAmount: '1000000'
    };
    const response = { statusCode: 200, message: 'OK', body: summaryBody };

    mockGetSummaryByEventId.mockResolvedValueOnce(response);
    mockUseApi.mockReturnValue({
      data: response,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useWithdrawalSummary('event-1'));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/withdrawal/summary', 'event-1'],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      summary: summaryBody,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(response);
    expect(mockGetSummaryByEventId).toHaveBeenCalledWith('event-1');
  });

  it('passes null key when eventId is undefined, empty, or whitespace and resolves null in fetcher', async () => {
    const mockMutate = jest.fn();
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Failed',
      mutate: mockMutate
    });

    const { result: undefResult } = renderHook(() => useWithdrawalSummary());
    expect(mockUseApi).toHaveBeenNthCalledWith(1, null, expect.any(Function));
    expect(undefResult.current).toEqual({
      summary: null,
      loading: true,
      error: 'Failed',
      mutate: mockMutate
    });

    const undefFetcher = mockUseApi.mock.calls[0][1];
    await expect(undefFetcher()).resolves.toBeNull();

    renderHook(() => useWithdrawalSummary('   '));
    expect(mockUseApi).toHaveBeenNthCalledWith(2, null, expect.any(Function));

    const wsFetcher = mockUseApi.mock.calls[1][1];
    await expect(wsFetcher()).resolves.toBeNull();
    expect(mockGetSummaryByEventId).not.toHaveBeenCalled();
  });
});
