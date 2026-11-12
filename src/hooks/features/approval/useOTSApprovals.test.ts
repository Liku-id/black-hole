import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventsService } from '@/services/events';

import { useOTSApprovals } from './useOTSApprovals';

jest.mock('@/services/events', () => ({
  eventsService: {
    getOTSApprovals: jest.fn()
  }
}));

const mockGetOTSApprovals = eventsService.getOTSApprovals as jest.Mock;

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

describe('useOTSApprovals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches OTS approvals with default enabled=true and no filters', async () => {
    const approvals = [
      {
        id: 'ots-1',
        event_id: 'event-1',
        requested_by: 'user-1',
        status: 'pending',
        created_at: '2026-01-01T00:00:00.000Z'
      }
    ];
    const pagination = {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
    mockGetOTSApprovals.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: { data: approvals, pagination }
    });

    const { result } = renderHook(() => useOTSApprovals(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetOTSApprovals).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(approvals);
    expect(result.current.pagination).toEqual(pagination);
    expect(result.current.error).toBeNull();
  });

  it('passes filters to eventsService.getOTSApprovals and refetches on filter change', async () => {
    mockGetOTSApprovals.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: { data: [], pagination: undefined }
    });

    const initialFilters = {
      status: 'pending',
      page: 1,
      limit: 10,
      event_id: 'event-1'
    };

    const { result, rerender } = renderHook(
      ({ filters }) => useOTSApprovals(filters),
      {
        initialProps: { filters: initialFilters },
        wrapper
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetOTSApprovals).toHaveBeenCalledWith(initialFilters);

    const nextFilters = {
      status: 'approved',
      page: 2,
      limit: 20,
      event_id: 'event-2'
    };
    rerender({ filters: nextFilters });

    await waitFor(() =>
      expect(mockGetOTSApprovals).toHaveBeenCalledWith(nextFilters)
    );
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useOTSApprovals({ status: 'pending' }, false),
      { wrapper }
    );

    expect(mockGetOTSApprovals).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.pagination).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('falls back to empty data when body is missing', async () => {
    mockGetOTSApprovals.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(() => useOTSApprovals(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.pagination).toBeUndefined();
  });

  it('handles error when getOTSApprovals rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetOTSApprovals.mockRejectedValue(
      new Error('Failed to fetch OTS approvals')
    );

    const { result } = renderHook(() => useOTSApprovals(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch OTS approvals');
  });

  it('re-fetches when mutate is called', async () => {
    mockGetOTSApprovals
      .mockResolvedValueOnce({
        body: { data: [{ id: 'ots-1' }], pagination: undefined }
      })
      .mockResolvedValueOnce({
        body: {
          data: [{ id: 'ots-1' }, { id: 'ots-2' }],
          pagination: undefined
        }
      });

    const { result } = renderHook(() => useOTSApprovals(), { wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(1));

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(mockGetOTSApprovals).toHaveBeenCalledTimes(2);
  });
});
