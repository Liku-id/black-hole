import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import {
  BanksResponse,
  eventOrganizerService
} from '@/services/event-organizer';

import { useBanks } from './useBanks';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    getBanks: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetBanks = eventOrganizerService.getBanks as jest.Mock;

describe('useBanks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls useApi with the banks key and returns its state', () => {
    const mockMutate = jest.fn();
    const banksData: BanksResponse = {
      banks: [
        {
          id: 'bank-1',
          name: 'BCA',
          channelCode: 'BCA',
          channelType: 'VIRTUAL_ACCOUNT',
          minAmount: 10000,
          maxAmount: 100000000
        }
      ]
    };

    mockUseApi.mockReturnValue({
      data: banksData,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useBanks());

    expect(mockUseApi).toHaveBeenCalledWith(['banks'], expect.any(Function));
    expect(result.current).toEqual({
      data: banksData,
      loading: false,
      error: null,
      mutate: mockMutate
    });
  });

  it('returns loading and error states from useApi', () => {
    const mockMutate = jest.fn();
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Failed to fetch banks',
      mutate: mockMutate
    });

    const { result } = renderHook(() => useBanks());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('Failed to fetch banks');
    expect(result.current.data).toBeUndefined();
  });

  it('executes fetcher calling eventOrganizerService.getBanks', async () => {
    const banksData: BanksResponse = { banks: [] };
    mockGetBanks.mockResolvedValueOnce(banksData);
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: false,
      error: null,
      mutate: jest.fn()
    });

    renderHook(() => useBanks());

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(banksData);
    expect(mockGetBanks).toHaveBeenCalledTimes(1);
  });
});
