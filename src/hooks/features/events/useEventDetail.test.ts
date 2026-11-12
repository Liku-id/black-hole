import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventsService } from '@/services';
import { createMockEventDetail } from '@/test-utils/factories';

import { useEventDetail } from './useEventDetail';

jest.mock('@/services', () => ({
  eventsService: {
    getEventDetail: jest.fn()
  }
}));

const mockGetEventDetail = eventsService.getEventDetail as jest.Mock;

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

describe('useEventDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches event detail when metaUrl is provided', async () => {
    const detail = createMockEventDetail({ metaUrl: 'wukong-fest' });
    mockGetEventDetail.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: detail
    });

    const { result } = renderHook(() => useEventDetail('wukong-fest'), {
      wrapper
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.eventDetail).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetEventDetail).toHaveBeenCalledWith('wukong-fest');
    expect(result.current.eventDetail).toEqual(detail);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when metaUrl is empty', () => {
    const { result } = renderHook(() => useEventDetail(''), { wrapper });

    expect(mockGetEventDetail).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.eventDetail).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('falls back to null when response body is missing', async () => {
    mockGetEventDetail.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(() => useEventDetail('wukong-fest'), {
      wrapper
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.eventDetail).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('returns error message when getEventDetail rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEventDetail.mockRejectedValue(
      new Error('Failed to fetch event detail')
    );

    const { result } = renderHook(() => useEventDetail('wukong-fest'), {
      wrapper
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.eventDetail).toBeNull();
    expect(result.current.error).toBe('Failed to fetch event detail');
  });

  it('re-fetches event detail when mutate is called', async () => {
    const detail1 = createMockEventDetail({ name: 'Event V1' });
    const detail2 = createMockEventDetail({ name: 'Event V2' });
    mockGetEventDetail
      .mockResolvedValueOnce({ body: detail1 })
      .mockResolvedValueOnce({ body: detail2 });

    const { result } = renderHook(() => useEventDetail('wukong-fest'), {
      wrapper
    });

    await waitFor(() =>
      expect(result.current.eventDetail?.name).toBe('Event V1')
    );

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() =>
      expect(result.current.eventDetail?.name).toBe('Event V2')
    );
    expect(mockGetEventDetail).toHaveBeenCalledTimes(2);
  });
});
