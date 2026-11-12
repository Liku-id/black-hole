import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventsService } from '@/services';
import { createMockEvent } from '@/test-utils/factories';
import { EventsFilters } from '@/types/event';

import { useFilteredEvents } from './useFilteredEvents';

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

describe('useFilteredEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sorts events by createdAt descending, limits to 2, and maps fields', async () => {
    const events = [
      createMockEvent({
        id: 'ev-oldest',
        name: 'Oldest Event',
        metaUrl: 'oldest-event',
        address: 'Address 1',
        createdAt: '2026-01-01T10:00:00.000Z',
        totalRevenue: '100000',
        eventAssets: [
          {
            id: 'ea-1',
            eventId: 'ev-oldest',
            assetId: 'a-1',
            order: '1',
            asset: {
              id: 'a-1',
              type: 'image',
              url: 'https://cdn.example.com/oldest.png',
              bucket: 'b',
              key: 'k',
              createdAt: '',
              updatedAt: ''
            }
          }
        ]
      }),
      createMockEvent({
        id: 'ev-newest',
        name: 'Newest Event',
        metaUrl: 'newest-event',
        address: 'Address 2',
        createdAt: '2026-03-15T12:00:00.000Z',
        totalRevenue: '500000',
        eventAssets: [
          {
            id: 'ea-2',
            eventId: 'ev-newest',
            assetId: 'a-2',
            order: '1',
            asset: {
              id: 'a-2',
              type: 'image',
              url: 'https://cdn.example.com/newest.png',
              bucket: 'b',
              key: 'k',
              createdAt: '',
              updatedAt: ''
            }
          }
        ]
      }),
      createMockEvent({
        id: 'ev-middle',
        name: 'Middle Event',
        metaUrl: 'middle-event',
        address: 'Address 3',
        createdAt: '2026-02-10T08:00:00.000Z',
        totalRevenue: '',
        eventAssets: []
      })
    ];

    const filters: EventsFilters = { status: 'approved' };
    mockGetEvents.mockResolvedValue({
      message: 'Success',
      body: { data: events }
    });

    const { result } = renderHook(() => useFilteredEvents(filters), {
      wrapper
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetEvents).toHaveBeenCalledWith(filters);
    expect(result.current.events).toEqual([
      {
        id: 'ev-newest',
        name: 'Newest Event',
        metaUrl: 'newest-event',
        address: 'Address 2',
        date: '2026-03-15T12:00:00.000Z',
        time: '2026-03-15T12:00:00.000Z',
        totalRevenue: 500000,
        thumbnail: 'https://cdn.example.com/newest.png'
      },
      {
        id: 'ev-middle',
        name: 'Middle Event',
        metaUrl: 'middle-event',
        address: 'Address 3',
        date: '2026-02-10T08:00:00.000Z',
        time: '2026-02-10T08:00:00.000Z',
        totalRevenue: 0,
        thumbnail: ''
      }
    ]);
    expect(result.current.error).toBeNull();
  });

  it('handles missing optional fields like totalRevenue and eventAssets', async () => {
    const eventWithoutOptionalFields = createMockEvent({
      id: 'ev-1',
      name: 'Minimal Event',
      metaUrl: 'minimal',
      address: 'Jakarta',
      createdAt: '2026-04-01T00:00:00.000Z',
      totalRevenue: undefined as unknown as string,
      eventAssets: undefined as unknown as any[]
    });

    mockGetEvents.mockResolvedValue({
      message: 'Success',
      body: { data: [eventWithoutOptionalFields] }
    });

    const { result } = renderHook(() => useFilteredEvents(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetEvents).toHaveBeenCalledWith(undefined);
    expect(result.current.events).toEqual([
      {
        id: 'ev-1',
        name: 'Minimal Event',
        metaUrl: 'minimal',
        address: 'Jakarta',
        date: '2026-04-01T00:00:00.000Z',
        time: '2026-04-01T00:00:00.000Z',
        totalRevenue: 0,
        thumbnail: ''
      }
    ]);
  });

  it('falls back to empty array when body or data is missing', async () => {
    mockGetEvents.mockResolvedValue({
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(() => useFilteredEvents(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toEqual([]);
  });

  it('returns error message when getEvents rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEvents.mockRejectedValue(new Error('Failed to load events'));

    const { result } = renderHook(() => useFilteredEvents(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBe('Failed to load events');
  });

  it('re-fetches when mutate is called', async () => {
    mockGetEvents
      .mockResolvedValueOnce({
        body: {
          data: [
            createMockEvent({
              id: 'ev-1',
              name: 'First',
              createdAt: '2026-01-01T00:00:00.000Z'
            })
          ]
        }
      })
      .mockResolvedValueOnce({
        body: {
          data: [
            createMockEvent({
              id: 'ev-2',
              name: 'Second',
              createdAt: '2026-01-02T00:00:00.000Z'
            })
          ]
        }
      });

    const { result } = renderHook(() => useFilteredEvents(), { wrapper });

    await waitFor(() => expect(result.current.events[0]?.name).toBe('First'));

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => expect(result.current.events[0]?.name).toBe('Second'));
    expect(mockGetEvents).toHaveBeenCalledTimes(2);
  });
});
