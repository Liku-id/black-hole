import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { ticketsService } from '@/services/tickets';
import { createMockTicketType } from '@/test-utils/factories';

import { useTicketTypesByEvent } from './useTicketTypesByEvent';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/tickets', () => ({
  ticketsService: {
    getTicketTypesByEvent: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetTicketTypesByEvent =
  ticketsService.getTicketTypesByEvent as jest.Mock;

describe('useTicketTypesByEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches ticketTypes array when eventId is provided', async () => {
    const mockMutate = jest.fn();
    const ticketTypes = [createMockTicketType()];
    mockGetTicketTypesByEvent.mockResolvedValueOnce(ticketTypes);
    mockUseApi.mockReturnValue({
      data: ticketTypes,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useTicketTypesByEvent('event-1'));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/tickets/ticket-types/event/event-1'],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      ticketTypes,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(ticketTypes);
    expect(mockGetTicketTypesByEvent).toHaveBeenCalledWith('event-1');
  });

  it('returns empty array when data is not an array and passes null key when eventId is null', async () => {
    const mockMutate = jest.fn();
    mockUseApi.mockReturnValue({
      data: { invalid: true },
      loading: true,
      error: 'Error loading ticket types',
      mutate: mockMutate
    });

    const { result } = renderHook(() => useTicketTypesByEvent(null));

    expect(mockUseApi).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current).toEqual({
      ticketTypes: [],
      loading: true,
      error: 'Error loading ticket types',
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual([]);
    expect(mockGetTicketTypesByEvent).not.toHaveBeenCalled();
  });
});
