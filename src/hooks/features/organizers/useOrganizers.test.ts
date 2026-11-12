import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { eventOrganizerService } from '@/services/event-organizer';
import { createMockEventOrganizer } from '@/test-utils/factories';

import { useOrganizers } from './useOrganizers';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    getAllEventOrganizers: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetAllEventOrganizers =
  eventOrganizerService.getAllEventOrganizers as jest.Mock;

describe('useOrganizers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns organizers from useApi and unwraps response.body.eventOrganizers in fetcher', async () => {
    const mockMutate = jest.fn();
    const eo = createMockEventOrganizer();
    mockGetAllEventOrganizers.mockResolvedValueOnce({
      statusCode: 0,
      message: 'Success',
      body: {
        eventOrganizers: [eo]
      }
    });
    mockUseApi.mockReturnValue({
      data: [eo],
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useOrganizers());

    expect(mockUseApi).toHaveBeenCalledWith(
      '/api/organizers',
      expect.any(Function)
    );
    expect(result.current).toEqual({
      organizers: [eo],
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual([eo]);
    expect(mockGetAllEventOrganizers).toHaveBeenCalledWith();
  });

  it('defaults organizers to empty array when data is undefined and propagates fetcher error', async () => {
    const mockMutate = jest.fn();
    mockGetAllEventOrganizers.mockRejectedValueOnce(new Error('API error'));
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'API error',
      mutate: mockMutate
    });

    const { result } = renderHook(() => useOrganizers());

    expect(result.current).toEqual({
      organizers: [],
      loading: true,
      error: 'API error',
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).rejects.toThrow('API error');
  });
});
