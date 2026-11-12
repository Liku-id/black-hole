import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { ticketsService } from '@/services/tickets';

import { useTicketType } from './useTicketType';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/tickets', () => ({
  ticketsService: {
    getTicketType: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetTicketType = ticketsService.getTicketType as jest.Mock;

describe('useTicketType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches ticketType and extracts additionalForms when ticketTypeId is provided', async () => {
    const mockMutate = jest.fn();
    const additionalForms = [
      {
        id: 'af-1',
        ticketTypeId: 'tt-1',
        field: 'Full Name',
        type: 'TEXT' as const,
        options: [],
        isRequired: true,
        order: 1,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01'
      }
    ];
    const ticketType = {
      id: 'tt-1',
      name: 'VIP',
      additional_forms: additionalForms
    };

    mockGetTicketType.mockResolvedValueOnce(ticketType);
    mockUseApi.mockReturnValue({
      data: ticketType,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useTicketType('tt-1'));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/tickets/ticket-types/tt-1'],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      ticketType,
      loading: false,
      error: null,
      mutate: mockMutate,
      additionalForms
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual(ticketType);
    expect(mockGetTicketType).toHaveBeenCalledWith('tt-1');
  });

  it('passes null key when ticketTypeId is null and handles missing data or missing additional_forms', async () => {
    const mockMutate = jest.fn();
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Not found',
      mutate: mockMutate
    });

    const { result } = renderHook(() => useTicketType(null));

    expect(mockUseApi).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current).toEqual({
      ticketType: null,
      loading: true,
      error: 'Not found',
      mutate: mockMutate,
      additionalForms: []
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toBeNull();
    expect(mockGetTicketType).not.toHaveBeenCalled();

    const ticketTypeWithoutForms = { id: 'tt-2', name: 'Regular' };
    mockUseApi.mockReturnValue({
      data: ticketTypeWithoutForms,
      loading: false,
      error: null,
      mutate: mockMutate
    });
    const { result: partialResult } = renderHook(() => useTicketType('tt-2'));
    expect(partialResult.current.ticketType).toEqual(ticketTypeWithoutForms);
    expect(partialResult.current.additionalForms).toEqual([]);
  });
});
