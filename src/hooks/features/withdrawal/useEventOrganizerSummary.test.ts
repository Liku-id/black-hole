import { renderHook } from '@testing-library/react';
import useSWR from 'swr';

import {
  EventOrganizerSummaryResponse,
  withdrawalService
} from '@/services/withdrawal';

import { useEventOrganizerSummary } from './useEventOrganizerSummary';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/services/withdrawal', () => ({
  withdrawalService: {
    getEventOrganizerSummary: jest.fn()
  }
}));

const mockUseSWR = useSWR as jest.Mock;
const mockGetEventOrganizerSummary =
  withdrawalService.getEventOrganizerSummary as jest.Mock;

describe('useEventOrganizerSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses query param key when eventOrganizerId is provided and returns summary body', async () => {
    const mockMutate = jest.fn();
    const response: EventOrganizerSummaryResponse = {
      statusCode: 200,
      message: 'OK',
      body: {
        eventOrganizerId: 'eo-1',
        eventOrganizerName: 'Wukong EO',
        email: 'eo@wukong.co.id',
        createdAt: '2026-01-01',
        totalEarnings: '1000000',
        totalWithdrawn: '400000',
        totalAvailable: '600000',
        totalPlatformFees: '50000',
        pendingSettlementAmount: '100000',
        totalEvents: 5,
        activeEvents: 2,
        completedEvents: 2,
        pendingEvents: 1,
        pendingWithdrawals: '100000',
        approvedWithdrawals: '300000',
        rejectedWithdrawals: '0',
        lastUpdated: '2026-01-10'
      }
    };

    mockGetEventOrganizerSummary.mockResolvedValueOnce(response);
    mockUseSWR.mockReturnValue({
      data: response,
      isLoading: false,
      error: undefined,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useEventOrganizerSummary('eo-1'));

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/withdrawal/event-organizer/summary?eventOrganizerId=eo-1',
      expect.any(Function),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: true
      }
    );
    expect(result.current).toEqual({
      summary: response.body,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const fetcher = mockUseSWR.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(response);
    expect(mockGetEventOrganizerSummary).toHaveBeenCalledWith('eo-1');
  });

  it('uses base key when eventOrganizerId is omitted or null and maps loading/error', async () => {
    const mockMutate = jest.fn();
    mockGetEventOrganizerSummary.mockResolvedValueOnce({
      statusCode: 200,
      message: 'OK',
      body: null
    });
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: new Error('Summary error'),
      mutate: mockMutate
    });

    const { result } = renderHook(() => useEventOrganizerSummary());

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/withdrawal/event-organizer/summary',
      expect.any(Function),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: true
      }
    );
    expect(result.current).toEqual({
      summary: null,
      loading: true,
      error: 'Summary error',
      mutate: mockMutate
    });

    const fetcher = mockUseSWR.mock.calls[0][1];
    await fetcher();
    expect(mockGetEventOrganizerSummary).toHaveBeenCalledWith(undefined);

    renderHook(() => useEventOrganizerSummary(null));
    expect(mockUseSWR).toHaveBeenNthCalledWith(
      2,
      '/api/withdrawal/event-organizer/summary',
      expect.any(Function),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: true
      }
    );
  });
});
