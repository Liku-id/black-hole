import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { apiUtils } from '@/utils/apiUtils';

import { useCities } from './useCities';

jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn()
  }
}));

const mockApiGet = apiUtils.get as jest.Mock;

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

describe('useCities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches cities and returns loading and data states', async () => {
    const cities = [
      { id: 'city-1', name: 'Jakarta' },
      { id: 'city-2', name: 'Bandung' }
    ];
    mockApiGet.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: cities
    });

    const { result } = renderHook(() => useCities(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockApiGet).toHaveBeenCalledWith(
      '/api/list/cities',
      {},
      'Failed to fetch cities'
    );
    expect(result.current.cities).toEqual(cities);
    expect(result.current.error).toBeNull();
  });

  it('falls back to empty array when response body is missing', async () => {
    mockApiGet.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(() => useCities(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns error message when fetching cities fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApiGet.mockRejectedValue(new Error('Failed to fetch cities'));

    const { result } = renderHook(() => useCities(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch cities');
  });
});
