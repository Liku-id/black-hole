import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventSubmissionsService } from '@/services/events-submissions';

import { useEventsSubmissionDetail } from './useEventsSubmissionDetail';

jest.mock('@/services/events-submissions', () => ({
  eventSubmissionsService: {
    getEventSubmissionDetail: jest.fn()
  }
}));

const mockGetDetail =
  eventSubmissionsService.getEventSubmissionDetail as jest.Mock;

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

describe('useEventsSubmissionDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches submission detail when id is provided', async () => {
    const mockDetail = { id: 'sub-1', type: 'new' };
    mockGetDetail.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: mockDetail
    });

    const { result } = renderHook(() => useEventsSubmissionDetail('sub-1'), {
      wrapper
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.submission).toBeUndefined();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetDetail).toHaveBeenCalledWith('sub-1');
    expect(result.current.submission).toEqual(mockDetail);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when id is undefined or empty', () => {
    const { result: undefResult } = renderHook(
      () => useEventsSubmissionDetail(undefined),
      { wrapper }
    );
    const { result: emptyResult } = renderHook(
      () => useEventsSubmissionDetail(''),
      { wrapper }
    );

    expect(mockGetDetail).not.toHaveBeenCalled();
    expect(undefResult.current.loading).toBe(false);
    expect(undefResult.current.submission).toBeUndefined();
    expect(undefResult.current.error).toBeNull();
    expect(emptyResult.current.loading).toBe(false);
    expect(emptyResult.current.submission).toBeUndefined();
  });

  it('returns undefined submission when response body is missing', async () => {
    mockGetDetail.mockResolvedValue({ statusCode: 200, message: 'Success' });

    const { result } = renderHook(() => useEventsSubmissionDetail('sub-1'), {
      wrapper
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.submission).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('returns error message when getEventSubmissionDetail rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetDetail.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useEventsSubmissionDetail('sub-1'), {
      wrapper
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.submission).toBeUndefined();
    expect(result.current.error).toBe('Not found');
  });

  it('re-fetches submission detail when mutate is called', async () => {
    mockGetDetail
      .mockResolvedValueOnce({ body: { id: 'sub-1', status: 'pending' } })
      .mockResolvedValueOnce({ body: { id: 'sub-1', status: 'approved' } });

    const { result } = renderHook(() => useEventsSubmissionDetail('sub-1'), {
      wrapper
    });

    await waitFor(() =>
      expect(result.current.submission).toEqual({
        id: 'sub-1',
        status: 'pending'
      })
    );

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() =>
      expect(result.current.submission).toEqual({
        id: 'sub-1',
        status: 'approved'
      })
    );
    expect(mockGetDetail).toHaveBeenCalledTimes(2);
  });
});
