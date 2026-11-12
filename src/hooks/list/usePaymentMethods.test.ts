import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { listService } from '@/services/list';

import { usePaymentMethods } from './usePaymentMethods';

jest.mock('@/services/list', () => ({
  listService: {
    getPaymentMethods: jest.fn()
  }
}));

const mockGetPaymentMethods = listService.getPaymentMethods as jest.Mock;

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

describe('usePaymentMethods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches grouped payment methods successfully', async () => {
    const grouped = {
      'Virtual Account': [
        {
          id: 'pm-1',
          name: 'BCA VA',
          type: 'va',
          logo: 'bca.png',
          bankId: 'bank-1',
          requestType: 'VA',
          paymentCode: 'BCA',
          paymentMethodFee: 4000,
          channelProperties: {},
          rules: [],
          bank: {
            id: 'bank-1',
            name: 'BCA',
            channelCode: 'BCA',
            channelType: 'VA',
            minAmount: 10000,
            maxAmount: 50000000
          }
        }
      ]
    };
    mockGetPaymentMethods.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: grouped
    });

    const { result } = renderHook(() => usePaymentMethods(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.paymentMethods).toEqual({});
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetPaymentMethods).toHaveBeenCalledTimes(1);
    expect(result.current.paymentMethods).toEqual(grouped);
    expect(result.current.error).toBeNull();
  });

  it('falls back to empty object when response body is missing', async () => {
    mockGetPaymentMethods.mockResolvedValue({
      statusCode: 200,
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(() => usePaymentMethods(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.paymentMethods).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('returns error message when listService.getPaymentMethods rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetPaymentMethods.mockRejectedValue(
      new Error('Failed to fetch payment methods')
    );

    const { result } = renderHook(() => usePaymentMethods(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.paymentMethods).toEqual({});
    expect(result.current.error).toBe('Failed to fetch payment methods');
  });
});
