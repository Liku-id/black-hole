import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import {
  GetPartnerTicketTypesFilters,
  partnerTicketTypesService
} from '@/services/partner-ticket-types';

import { useApi } from '../../useApi';

import { usePartnerTicketTypes } from './usePartnerTicketTypes';

jest.mock('@/services/partner-ticket-types', () => ({
  partnerTicketTypesService: {
    getPartnerTicketTypes: jest.fn()
  }
}));

jest.mock('../../useApi', () => {
  const actual = jest.requireActual('../../useApi');
  return {
    useApi: jest.fn((...args: unknown[]) => actual.useApi(...args))
  };
});

const mockGetPartnerTicketTypes =
  partnerTicketTypesService.getPartnerTicketTypes as jest.Mock;
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

describe('usePartnerTicketTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not fetch when filters is null and resolves null from fallback fetcher', async () => {
    const { result } = renderHook(() => usePartnerTicketTypes(null), {
      wrapper
    });

    expect(mockGetPartnerTicketTypes).not.toHaveBeenCalled();
    expect(result.current.partnerTicketTypes).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toBeUndefined();

    const [capturedKey, capturedFetcher] = mockUseApi.mock.calls[0];
    expect(capturedKey).toBeNull();
    await expect(capturedFetcher()).resolves.toBeNull();
    expect(mockGetPartnerTicketTypes).not.toHaveBeenCalled();
  });

  it('fetches partner ticket types when filters are provided', async () => {
    const partnerTicketTypes = [{ id: 'ptt-1', code: 'PROMO10' }];
    const pagination = {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
    mockGetPartnerTicketTypes.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: { data: partnerTicketTypes, pagination }
    });

    const filters: GetPartnerTicketTypesFilters = {
      event_id: 'event-1',
      page: 1,
      limit: 10
    };

    const { result } = renderHook(() => usePartnerTicketTypes(filters), {
      wrapper
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.partnerTicketTypes).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetPartnerTicketTypes).toHaveBeenCalledWith(filters);
    expect(result.current.partnerTicketTypes).toEqual(partnerTicketTypes);
    expect(result.current.pagination).toEqual(pagination);
    expect(result.current.error).toBeNull();
  });

  it('falls back to empty array when body or data is missing', async () => {
    mockGetPartnerTicketTypes.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(
      () => usePartnerTicketTypes({ event_id: 'event-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.partnerTicketTypes).toEqual([]);
    expect(result.current.pagination).toBeUndefined();
  });

  it('returns error message when getPartnerTicketTypes rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetPartnerTicketTypes.mockRejectedValue(
      new Error('Failed to fetch partner ticket types')
    );

    const { result } = renderHook(
      () => usePartnerTicketTypes({ event_id: 'event-1' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.partnerTicketTypes).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch partner ticket types');
  });

  it('re-fetches partner ticket types when mutate is called', async () => {
    mockGetPartnerTicketTypes
      .mockResolvedValueOnce({
        body: { data: [{ id: 'ptt-1' }], pagination: undefined }
      })
      .mockResolvedValueOnce({
        body: {
          data: [{ id: 'ptt-1' }, { id: 'ptt-2' }],
          pagination: undefined
        }
      });

    const { result } = renderHook(
      () => usePartnerTicketTypes({ event_id: 'event-1' }),
      { wrapper }
    );

    await waitFor(() =>
      expect(result.current.partnerTicketTypes).toHaveLength(1)
    );

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() =>
      expect(result.current.partnerTicketTypes).toHaveLength(2)
    );
    expect(mockGetPartnerTicketTypes).toHaveBeenCalledTimes(2);
  });
});
