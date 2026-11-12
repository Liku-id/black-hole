import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { eventsService } from '@/services';
import { formatUtils } from '@/utils/formatUtils';

import { useOTSSummary } from './useOTSSummary';

jest.mock('@/services', () => ({
  eventsService: {
    getOTSSummary: jest.fn()
  }
}));

const mockGetOTSSummary = eventsService.getOTSSummary as jest.Mock;

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

describe('useOTSSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not fetch when eventId is empty', () => {
    const { result } = renderHook(() => useOTSSummary(''), { wrapper });

    expect(mockGetOTSSummary).not.toHaveBeenCalled();
    expect(result.current.summary).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('fetches and formats summary from response.body', async () => {
    mockGetOTSSummary.mockResolvedValue({
      body: {
        totalRevenue: 1500000,
        ticketSold: 120,
        totalTransaction: 45,
        totalVisitors: 95
      }
    });

    const { result } = renderHook(() => useOTSSummary('event-1'), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.summary).toBeUndefined();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetOTSSummary).toHaveBeenCalledWith('event-1');
    expect(result.current.summary).toEqual({
      totalRevenue: formatUtils.formatCurrency(1500000),
      ticketSold: formatUtils.formatNumber(120),
      totalTransaction: formatUtils.formatNumber(45),
      totalVisitors: formatUtils.formatNumber(95)
    });
    expect(result.current.error).toBeUndefined();
  });

  it('falls back to response.data and defaults missing numeric fields to 0', async () => {
    mockGetOTSSummary.mockResolvedValue({
      data: {
        totalRevenue: undefined,
        ticketSold: 0,
        totalTransaction: null,
        totalVisitors: undefined
      }
    });

    const { result } = renderHook(() => useOTSSummary('event-2'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toEqual({
      totalRevenue: formatUtils.formatCurrency(0),
      ticketSold: formatUtils.formatNumber(0),
      totalTransaction: formatUtils.formatNumber(0),
      totalVisitors: formatUtils.formatNumber(0)
    });
  });

  it('returns undefined summary when neither response.body nor response.data is present', async () => {
    mockGetOTSSummary.mockResolvedValue({ statusCode: 200 });

    const { result } = renderHook(() => useOTSSummary('event-3'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('returns error when getOTSSummary rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('Summary fetch failed');
    mockGetOTSSummary.mockRejectedValue(err);

    const { result } = renderHook(() => useOTSSummary('event-1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toBeUndefined();
    expect(result.current.error).toBe(err);
  });
});
