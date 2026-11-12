import { renderHook } from '@testing-library/react';

import { useApi } from '@/hooks/useApi';
import { AdditionalForm, ticketsService } from '@/services/tickets';

import { useDistinctAdditionalForms } from './useDistinctAdditionalForms';

jest.mock('@/hooks/useApi', () => ({
  useApi: jest.fn()
}));

jest.mock('@/services/tickets', () => ({
  ticketsService: {
    getDistinctAdditionalFormFields: jest.fn()
  }
}));

const mockUseApi = useApi as jest.Mock;
const mockGetDistinctAdditionalFormFields =
  ticketsService.getDistinctAdditionalFormFields as jest.Mock;

describe('useDistinctAdditionalForms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches distinct additional forms when eventId is provided', async () => {
    const mockMutate = jest.fn();
    const forms: AdditionalForm[] = [
      {
        id: 'form-1',
        ticketTypeId: 'tt-1',
        field: 'T-Shirt Size',
        type: 'DROPDOWN',
        options: ['S', 'M', 'L'],
        isRequired: true,
        order: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      }
    ];

    mockGetDistinctAdditionalFormFields.mockResolvedValueOnce({
      statusCode: 200,
      message: 'OK',
      additionalForms: forms
    });
    mockUseApi.mockReturnValue({
      data: { additionalForms: forms },
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const { result } = renderHook(() => useDistinctAdditionalForms('event-1'));

    expect(mockUseApi).toHaveBeenCalledWith(
      ['/api/tickets/additional-forms/distinct/event/event-1'],
      expect.any(Function)
    );
    expect(result.current).toEqual({
      distinctForms: forms,
      loading: false,
      error: null,
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toEqual({
      statusCode: 200,
      message: 'OK',
      additionalForms: forms
    });
    expect(mockGetDistinctAdditionalFormFields).toHaveBeenCalledWith('event-1');
  });

  it('passes null key when eventId is null or empty and returns defaults', async () => {
    const mockMutate = jest.fn();
    mockUseApi.mockReturnValue({
      data: undefined,
      loading: true,
      error: 'Failed to load',
      mutate: mockMutate
    });

    const { result } = renderHook(() => useDistinctAdditionalForms(null));

    expect(mockUseApi).toHaveBeenCalledWith(null, expect.any(Function));
    expect(result.current).toEqual({
      distinctForms: [],
      loading: true,
      error: 'Failed to load',
      mutate: mockMutate
    });

    const fetcher = mockUseApi.mock.calls[0][1];
    await expect(fetcher()).resolves.toBeNull();
    expect(mockGetDistinctAdditionalFormFields).not.toHaveBeenCalled();
  });
});
