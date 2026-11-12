import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventsService } from '@/services';
import { createMockEvent } from '@/test-utils/factories';
import { EventsFilters } from '@/types/event';

import { useEvents } from './useEvents';

jest.mock('@/services', () => ({
  eventsService: {
    getEvents: jest.fn()
  }
}));

const mockGetEvents = eventsService.getEvents as jest.Mock;

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

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches events without filters and returns counts and pagination', async () => {
    const events = [createMockEvent({ id: 'ev-1' })];
    const eventCountByStatus = {
      approved: 1,
      done: 0,
      draft: 2,
      onGoing: 0,
      onReview: 1,
      rejected: 0
    };
    const pagination = {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };

    mockGetEvents.mockResolvedValue({
      message: 'Success',
      body: {
        data: events,
        eventCountByStatus,
        pagination
      }
    });

    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetEvents).toHaveBeenCalledWith(undefined);
    expect(result.current.events).toEqual(events);
    expect(result.current.eventCountByStatus).toEqual(eventCountByStatus);
    expect(result.current.pagination).toEqual(pagination);
    expect(result.current.error).toBeNull();
  });

  it('passes filters and refetches when filters change', async () => {
    mockGetEvents.mockResolvedValue({
      message: 'Success',
      body: {
        data: [],
        eventCountByStatus: undefined,
        pagination: undefined
      }
    });

    const initialFilters: EventsFilters = {
      page: 1,
      show: 10,
      name: 'Rock',
      status: 'approved'
    };

    const { result, rerender } = renderHook(
      ({ filters }: { filters?: EventsFilters }) => useEvents(filters),
      {
        initialProps: { filters: initialFilters },
        wrapper
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetEvents).toHaveBeenCalledWith(initialFilters);

    const nextFilters: EventsFilters = {
      page: 2,
      show: 20,
      status: ['draft', 'onReview']
    };
    rerender({ filters: nextFilters });

    await waitFor(() =>
      expect(mockGetEvents).toHaveBeenCalledWith(nextFilters)
    );
  });

  it('falls back to empty events when body is missing', async () => {
    mockGetEvents.mockResolvedValue({
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toEqual([]);
    expect(result.current.eventCountByStatus).toBeUndefined();
    expect(result.current.pagination).toBeUndefined();
  });

  it('returns error message when getEvents rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEvents.mockRejectedValue(new Error('Failed to fetch events'));

    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch events');
  });

  it('re-fetches events when mutate is called', async () => {
    mockGetEvents
      .mockResolvedValueOnce({
        body: { data: [createMockEvent({ id: 'ev-1' })] }
      })
      .mockResolvedValueOnce({
        body: {
          data: [
            createMockEvent({ id: 'ev-1' }),
            createMockEvent({ id: 'ev-2' })
          ]
        }
      });

    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => expect(result.current.events).toHaveLength(1));

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => expect(result.current.events).toHaveLength(2));
    expect(mockGetEvents).toHaveBeenCalledTimes(2);
  });
});
