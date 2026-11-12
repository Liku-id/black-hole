import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { eventOrganizerService } from '@/services/event-organizer';
import { EventOrganizerStatistics } from '@/types/organizer';

import { useEventOrganizerStatistics } from './useEventOrganizerStatistics';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    getEventOrganizerStatistics: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetEventOrganizerStatistics =
  eventOrganizerService.getEventOrganizerStatistics as jest.Mock;

describe('useEventOrganizerStatistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches statistics with eventOrganizerId when enabled defaults to true', async () => {
    const mockMutate = jest.fn();
    const stats: EventOrganizerStatistics = {
      event_organizer_name: 'Wukong EO',
      total_tickets_sold: 150,
      total_revenue: 15000000,
      total_successful_transactions: 75,
      average_tickets_per_transaction: 2
    };

    mockGetEventOrganizerStatistics.mockResolvedValueOnce({
      status_code: 0,
      message: 'OK',
      body: stats
    });

    mockUseApi.mockReturnValue({
      data: { body: stats },
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useEventOrganizerStatistics('eo-1'));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/event-organizers/statistics', 'eo-1'],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      data: stats,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual({
      status_code: 0,
      message: 'OK',
      body: stats
    });
    expect(mockGetEventOrganizerStatistics).toHaveBeenCalledWith('eo-1');
  });

  it('supports optional eventOrganizerId and returns null data when body is absent', async () => {
    mockGetEventOrganizerStatistics.mockResolvedValueOnce({
      status_code: 0,
      body: null
    });
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Error fetching stats',
      mutate: jest.fn()
    });

    const { result } = renderHook(() => useEventOrganizerStatistics());

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/event-organizers/statistics', undefined],
      expect.any(Function)
    );
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('Error fetching stats');

    const fetcher = mockUseApi.mock.calls[0][1];
    await fetcher();
    expect(mockGetEventOrganizerStatistics).toHaveBeenCalledWith(undefined);
  });

  it('passes null key when enabled is false', () => {
    mockUseApi.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      mutate: jest.fn()
    });

    const { result } = renderHook(() =>
      useEventOrganizerStatistics('eo-1', false)
    );

    expect(mockUseApi).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current.data).toBeNull();
  });
});
