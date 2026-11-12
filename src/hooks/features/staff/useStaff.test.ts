import { act, renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { staffService } from '@/services/staff';
import { ListStaffRequest } from '@/types/staff';

import { useStaff } from './useStaff';

jest.mock('@/services/staff', () => ({
  staffService: {
    getStaffList: jest.fn()
  }
}));

const mockGetStaffList = staffService.getStaffList as jest.Mock;

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

describe('useStaff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not fetch when eventOrganizerId is empty', () => {
    const { result } = renderHook(() => useStaff(''), { wrapper });

    expect(mockGetStaffList).not.toHaveBeenCalled();
    expect(result.current.staffList).toEqual([]);
    expect(result.current.pagination).toEqual({
      page: 0,
      show: 10,
      total: 0,
      totalPage: 0
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBeUndefined();
  });

  it('fetches staff list with params and maps pagination', async () => {
    const staff = [
      {
        user_id: 'u-1',
        full_name: 'John Cashier',
        email: 'john@example.com',
        phone_number: '08123456789',
        role: { id: 'r-1', name: 'cashier' },
        status: 'active'
      }
    ];
    mockGetStaffList.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: {
        staff,
        pagination: {
          page: 2,
          limit: 25,
          totalRecords: 30,
          totalPages: 2,
          hasNext: false,
          hasPrev: true
        }
      }
    });

    const params: ListStaffRequest = {
      page: 2,
      limit: 25,
      search: 'John',
      role: 'cashier'
    };

    const { result } = renderHook(() => useStaff('eo-1', params), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.staffList).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetStaffList).toHaveBeenCalledWith('eo-1', params);
    expect(result.current.staffList).toEqual(staff);
    expect(result.current.pagination).toEqual({
      page: 2,
      show: 25,
      total: 30,
      totalPage: 2
    });
    expect(result.current.isError).toBeUndefined();
  });

  it('falls back to default staffList and pagination when body or pagination fields are missing', async () => {
    mockGetStaffList.mockResolvedValue({
      status_code: 200,
      message: 'Success',
      body: undefined
    });

    const { result } = renderHook(() => useStaff('eo-1'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetStaffList).toHaveBeenCalledWith('eo-1', undefined);
    expect(result.current.staffList).toEqual([]);
    expect(result.current.pagination).toEqual({
      page: 0,
      show: 10,
      total: 0,
      totalPage: 0
    });
  });

  it('sets isError when getStaffList rejects', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('Failed to fetch staff list');
    mockGetStaffList.mockRejectedValue(err);

    const { result } = renderHook(() => useStaff('eo-1'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.staffList).toEqual([]);
    expect(result.current.isError).toBe(err);
  });

  it('re-fetches staff list when mutate is called', async () => {
    mockGetStaffList
      .mockResolvedValueOnce({
        body: {
          staff: [{ user_id: 'u-1', full_name: 'Alice' }],
          pagination: { page: 1, limit: 10, totalRecords: 1, totalPages: 1 }
        }
      })
      .mockResolvedValueOnce({
        body: {
          staff: [
            { user_id: 'u-1', full_name: 'Alice' },
            { user_id: 'u-2', full_name: 'Bob' }
          ],
          pagination: { page: 1, limit: 10, totalRecords: 2, totalPages: 1 }
        }
      });

    const { result } = renderHook(() => useStaff('eo-1'), { wrapper });

    await waitFor(() => expect(result.current.staffList).toHaveLength(1));

    await act(async () => {
      await result.current.mutate();
    });

    await waitFor(() => expect(result.current.staffList).toHaveLength(2));
    expect(mockGetStaffList).toHaveBeenCalledTimes(2);
  });
});
