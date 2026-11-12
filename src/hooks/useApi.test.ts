import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { Middleware, SWRConfig, SWRConfiguration } from 'swr';

import { useApi } from './useApi';

const createWrapper = (extraConfig?: SWRConfiguration) => {
  return ({ children }: { children: ReactNode }) =>
    React.createElement(
      SWRConfig,
      {
        value: {
          provider: () => new Map(),
          dedupingInterval: 0,
          shouldRetryOnError: false,
          ...extraConfig
        }
      },
      children
    );
};

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches data with default SWR options and transitions loading state', async () => {
    let capturedConfig: SWRConfiguration | undefined;
    const captureMiddleware: Middleware =
      (useSWRNext) => (key, fetcher, config) => {
        capturedConfig = config;
        return useSWRNext(key, fetcher, config);
      };

    const fetcher = jest.fn().mockResolvedValue({ items: [1, 2, 3] });

    const { result } = renderHook(() => useApi('/api/items', fetcher), {
      wrapper: createWrapper({ use: [captureMiddleware] })
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ items: [1, 2, 3] });
    expect(result.current.error).toBeNull();
    expect(typeof result.current.mutate).toBe('function');
    expect(capturedConfig?.refreshInterval).toBe(30000);
    expect(capturedConfig?.revalidateOnFocus).toBe(true);
    expect(capturedConfig?.errorRetryCount).toBe(3);
  });

  it('supports array keys and overrides default options when provided', async () => {
    let capturedConfig: SWRConfiguration | undefined;
    const captureMiddleware: Middleware =
      (useSWRNext) => (key, fetcher, config) => {
        capturedConfig = config;
        return useSWRNext(key, fetcher, config);
      };

    const fetcher = jest.fn().mockResolvedValue({ ok: true });

    const { result } = renderHook(
      () =>
        useApi(['/api/items', { page: 2 }], fetcher, {
          refreshInterval: 5000,
          revalidateOnFocus: false,
          errorRetryCount: 1
        }),
      {
        wrapper: createWrapper({ use: [captureMiddleware] })
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ ok: true });
    expect(capturedConfig?.refreshInterval).toBe(5000);
    expect(capturedConfig?.revalidateOnFocus).toBe(false);
    expect(capturedConfig?.errorRetryCount).toBe(1);
  });

  it('does not call fetcher when key is null', () => {
    const fetcher = jest.fn().mockResolvedValue('never');

    const { result } = renderHook(() => useApi(null, fetcher), {
      wrapper: createWrapper()
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('returns error message when fetcher rejects with an Error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const fetcher = jest.fn().mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(
      () => useApi('/api/fail', fetcher, { errorRetryCount: 0 }),
      {
        wrapper: createWrapper()
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe('Network failure');
  });

  it('returns null error when rejected value has no message property', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const fetcher = jest.fn().mockRejectedValue({});

    const { result } = renderHook(
      () => useApi('/api/fail-empty', fetcher, { errorRetryCount: 0 }),
      {
        wrapper: createWrapper()
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('re-fetches data when mutate is invoked', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 2 });

    const { result } = renderHook(() => useApi('/api/count', fetcher), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.data).toEqual({ count: 1 }));

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => expect(result.current.data).toEqual({ count: 2 }));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
