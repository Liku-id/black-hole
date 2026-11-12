import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { eventOrganizerService } from '@/services/event-organizer';
import { createMockEventOrganizer } from '@/test-utils/factories';
import {
  ListEventOrganizersRequest,
  ListEventOrganizersResponse
} from '@/types/organizer';

import { useEventOrganizers } from './useEventOrganizers';

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

describe('useEventOrganizers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches event organizers with filters and maps pagination', async () => {
    const mockMutate = jest.fn();
    const filters: ListEventOrganizersRequest = {
      name: 'Wukong',
      page: 2,
      show: 15
    };
    const eo = createMockEventOrganizer();
    const response: ListEventOrganizersResponse = {
      statusCode: 0,
      message: 'Success',
      body: {
        eventOrganizers: [eo],
        show: 15,
        page: 2,
        total: 30,
        totalPage: 2
      }
    };

    mockGetAllEventOrganizers.mockResolvedValueOnce(response);
    mockUseApi.mockReturnValue({
      data: response,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useEventOrganizers(filters));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/organizers', filters],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      eventOrganizers: [eo],
      loading: false,
      error: null,
      mutate: mockMutate,
      pagination: {
        show: 15,
        page: 2,
        total: 30,
        totalPage: 2
      }
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(response);
    expect(mockGetAllEventOrganizers).toHaveBeenCalledWith(filters);
  });

  it('defaults eventOrganizers to empty array and pagination to null when data is missing', async () => {
    const mockMutate = jest.fn();
    mockGetAllEventOrganizers.mockResolvedValueOnce({
      statusCode: 0,
      message: 'Success',
      body: {
        eventOrganizers: [],
        show: 10,
        page: 1,
        total: 0,
        totalPage: 0
      }
    });
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Fetch failed',
      mutate: mockMutate
    });

    const { result } = renderHook(() => useEventOrganizers());

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/organizers', undefined],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      eventOrganizers: [],
      loading: true,
      error: 'Fetch failed',
      mutate: mockMutate,
      pagination: null
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await fetcher();
    expect(mockGetAllEventOrganizers).toHaveBeenCalledWith(undefined);
  });
});
