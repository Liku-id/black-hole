import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventTypesService } from '@/services';

import { useEventTypes } from './useEventTypes';

jest.mock('@/services', () => ({
  eventTypesService: {
    getEventTypes: jest.fn()
  }
}));

const mockGetEventTypes = eventTypesService.getEventTypes as jest.Mock;

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

describe('useEventTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches event types and returns loading and data states', async () => {
    const eventTypes = ['Music', 'Sports', 'Conference'];
    mockGetEventTypes.mockResolvedValue({ eventTypes });

    const { result } = renderHook(() => useEventTypes(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.eventTypes).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetEventTypes).toHaveBeenCalledTimes(1);
    expect(result.current.eventTypes).toEqual(eventTypes);
    expect(result.current.error).toBeNull();
  });

  it('falls back to empty array when eventTypes is missing in response', async () => {
    mockGetEventTypes.mockResolvedValue({});

    const { result } = renderHook(() => useEventTypes(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.eventTypes).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns error message when getEventTypes rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEventTypes.mockRejectedValue(new Error('Failed to fetch types'));

    const { result } = renderHook(() => useEventTypes(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.eventTypes).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch types');
  });

  it('refetches event types when refetch is called', async () => {
    mockGetEventTypes
      .mockResolvedValueOnce({ eventTypes: ['Music'] })
      .mockResolvedValueOnce({ eventTypes: ['Music', 'Workshop'] });

    const { result } = renderHook(() => useEventTypes(), { wrapper });

    await waitFor(() => expect(result.current.eventTypes).toEqual(['Music']));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.eventTypes).toEqual(['Music', 'Workshop'])
    );
    expect(mockGetEventTypes).toHaveBeenCalledTimes(2);
  });
});
