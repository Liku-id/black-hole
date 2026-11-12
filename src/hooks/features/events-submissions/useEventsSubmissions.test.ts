import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventSubmissionsService } from '@/services/events-submissions';
import { EventSubmissionsFilters } from '@/types/events-submission';

import { useEventsSubmissions } from './useEventsSubmissions';

jest.mock('@/services/events-submissions', () => ({
  eventSubmissionsService: {
    getEventSubmissions: jest.fn()
  }
}));

const mockGetSubmissions =
  eventSubmissionsService.getEventSubmissions as jest.Mock;

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

describe('useEventsSubmissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches event submissions without filters', async () => {
    const submissions = [{ id: 'sub-1', type: 'new' }];
    const pagination = {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
    mockGetSubmissions.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: { data: submissions, pagination }
    });

    const { result } = renderHook(() => useEventsSubmissions(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.submissions).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetSubmissions).toHaveBeenCalledWith(undefined);
    expect(result.current.submissions).toEqual(submissions);
    expect(result.current.pagination).toEqual(pagination);
    expect(result.current.error).toBeNull();
  });

  it('passes filters and refetches when filters change', async () => {
    mockGetSubmissions.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: { data: [], pagination: undefined }
    });

    const initialFilters: EventSubmissionsFilters = {
      show: 10,
      page: 1,
      search: 'music',
      type: 'new'
    };

    const { result, rerender } = renderHook(
      ({ filters }: { filters?: EventSubmissionsFilters }) =>
        useEventsSubmissions(filters),
      {
        initialProps: { filters: initialFilters },
        wrapper
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetSubmissions).toHaveBeenCalledWith(initialFilters);

    const updatedFilters: EventSubmissionsFilters = {
      show: 20,
      page: 2,
      type: 'update'
    };
    rerender({ filters: updatedFilters });

    await waitFor(() =>
      expect(mockGetSubmissions).toHaveBeenCalledWith(updatedFilters)
    );
  });

  it('falls back to empty array when body or data is missing', async () => {
    mockGetSubmissions.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(() => useEventsSubmissions(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.submissions).toEqual([]);
    expect(result.current.pagination).toBeUndefined();
  });

  it('handles errors when getEventSubmissions rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetSubmissions.mockRejectedValue(
      new Error('Failed to fetch event submissions')
    );

    const { result } = renderHook(() => useEventsSubmissions(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.submissions).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch event submissions');
  });

  it('re-fetches submissions when mutate is called', async () => {
    mockGetSubmissions
      .mockResolvedValueOnce({
        body: { data: [{ id: 'sub-1' }], pagination: undefined }
      })
      .mockResolvedValueOnce({
        body: {
          data: [{ id: 'sub-1' }, { id: 'sub-2' }],
          pagination: undefined
        }
      });

    const { result } = renderHook(() => useEventsSubmissions(), { wrapper });

    await waitFor(() => expect(result.current.submissions).toHaveLength(1));

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => expect(result.current.submissions).toHaveLength(2));
    expect(mockGetSubmissions).toHaveBeenCalledTimes(2);
  });
});
