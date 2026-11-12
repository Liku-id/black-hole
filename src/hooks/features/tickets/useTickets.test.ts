import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { ticketsService } from '@/services';
import { TicketsFilters } from '@/types/ticket';

import { useTickets } from './useTickets';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services', () => ({
  ticketsService: {
    getTickets: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetTickets = ticketsService.getTickets as jest.Mock;

describe('useTickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches tickets, pagination, and stats when filters and eventId are provided', async () => {
    const mockMutate = jest.fn();
    const filters: TicketsFilters = {
      eventId: 'event-1',
      page: 1,
      show: 10,
      search: 'alice',
      ticketTypeIds: 'tt-1',
      ticketStatus: 'issued'
    };
    const pagination = {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };
    const stats = {
      totalIssued: 1,
      totalRedeem: 0,
      totalTicket: 1
    };
    const ticket = {
      id: 't-1',
      ticket_type_id: 'tt-1',
      transaction_id: 'tx-1',
      ticket_id: 'TCK-1',
      ticket_name: 'VIP',
      visitor_name: 'Alice',
      ticket_status: 'issued',
      issued_at: '2026-01-01',
      created_at: '2026-01-01',
      updated_at: '2026-01-01'
    };
    const response = {
      statusCode: 200,
      message: 'OK',
      body: {
        data: [ticket],
        pagination,
        stats
      }
    };

    mockGetTickets.mockResolvedValueOnce(response);
    mockUseApi.mockReturnValue({
      data: response,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useTickets(filters));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/tickets', filters],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      tickets: [ticket],
      loading: false,
      error: null,
      mutate: mockMutate,
      pagination,
      stats
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(response);
    expect(mockGetTickets).toHaveBeenCalledWith(filters);
  });

  it('passes null key when filters is null and resolves null in fetcher when eventId is empty', async () => {
    const mockMutate = jest.fn();
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: false,
      error: 'Error fetching tickets',
      mutate: mockMutate
    });

    const { result: nullFiltersResult } = renderHook(() => useTickets(null));
    expect(mockUseApi).toHaveBeenNthCalledWith(1, null, expect.any(Function));
    expect(nullFiltersResult.current).toEqual({
      tickets: [],
      loading: false,
      error: 'Error fetching tickets',
      mutate: mockMutate,
      pagination: undefined,
      stats: undefined
    });

    const emptyEventFilters: TicketsFilters = { eventId: '' };
    renderHook(() => useTickets(emptyEventFilters));
    expect(mockUseApi).toHaveBeenNthCalledWith(
      2,
      ['/api/tickets', emptyEventFilters],
      expect.any(Function)
    );

    const fetcher = mockUseApi.mock.calls[1][1];
    await expect(fetcher()).resolves.toBeNull();
    expect(mockGetTickets).not.toHaveBeenCalled();
  });
});
