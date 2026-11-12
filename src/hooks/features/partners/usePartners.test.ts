import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { GetPartnersFilters, partnersService } from '@/services/partners';

import { useApi } from '../../useApi';

import { usePartners } from './usePartners';

jest.mock('@/services/partners', () => ({
  partnersService: {
    getPartners: jest.fn()
  }
}));

jest.mock('../../useApi', () => {
  const actual = jest.requireActual('../../useApi');
  return {
    useApi: jest.fn((...args: unknown[]) => actual.useApi(...args))
  };
});

const mockGetPartners = partnersService.getPartners as jest.Mock;
const mockUseApi = useApi as jest.Mock;

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

describe('usePartners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not fetch when filters is null and resolves null from fallback fetcher', async () => {
    const { result } = renderHook(() => usePartners(null), { wrapper });

    expect(mockGetPartners).not.toHaveBeenCalled();
    expect(result.current.partners).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toBeUndefined();

    const [capturedKey, capturedFetcher] = mockUseApi.mock.calls[0];
    expect(capturedKey).toBeNull();
    await expect(capturedFetcher()).resolves.toBeNull();
    expect(mockGetPartners).not.toHaveBeenCalled();
  });

  it('fetches partners when filters are provided', async () => {
    const partners = [{ id: 'p-1', partner_name: 'Partner A' }];
    const pagination = {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
    mockGetPartners.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: { data: partners, pagination }
    });

    const filters: GetPartnersFilters = {
      event_organizer_id: 'eo-1',
      page: 1,
      limit: 10,
      search: 'Partner'
    };

    const { result } = renderHook(() => usePartners(filters), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.partners).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetPartners).toHaveBeenCalledWith(filters);
    expect(result.current.partners).toEqual(partners);
    expect(result.current.pagination).toEqual(pagination);
    expect(result.current.error).toBeNull();
  });

  it('falls back to empty partners when body or data is missing', async () => {
    mockGetPartners.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(
      () => usePartners({ event_organizer_id: 'eo-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.partners).toEqual([]);
    expect(result.current.pagination).toBeUndefined();
  });

  it('returns error message when getPartners rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetPartners.mockRejectedValue(new Error('Failed to fetch partners'));

    const { result } = renderHook(
      () => usePartners({ event_organizer_id: 'eo-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.partners).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch partners');
  });

  it('re-fetches partners when mutate is called', async () => {
    mockGetPartners
      .mockResolvedValueOnce({
        body: { data: [{ id: 'p-1' }], pagination: undefined }
      })
      .mockResolvedValueOnce({
        body: { data: [{ id: 'p-1' }, { id: 'p-2' }], pagination: undefined }
      });

    const { result } = renderHook(
      () => usePartners({ event_organizer_id: 'eo-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.partners).toHaveLength(1));

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => expect(result.current.partners).toHaveLength(2));
    expect(mockGetPartners).toHaveBeenCalledTimes(2);
  });
});
