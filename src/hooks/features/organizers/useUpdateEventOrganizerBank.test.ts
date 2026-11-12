import { act, renderHook } from '@testing-library/react';

import {
  eventOrganizerService,
  UpdateBankPayload
} from '@/services/event-organizer';

import { useUpdateEventOrganizerBank } from './useUpdateEventOrganizerBank';

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    updateEventOrganizerBank: jest.fn()
  }
}));

const mockUpdateBank =
  eventOrganizerService.updateEventOrganizerBank as jest.Mock;

describe('useUpdateEventOrganizerBank', () => {
  const payload: UpdateBankPayload = {
    bank_id: 'bank-1',
    account_number: '1234567890',
    account_holder_name: 'PT Wukong'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('has initial idle state', () => {
    const { result } = renderHook(() => useUpdateEventOrganizerBank());

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('tracks pending state and resolves with service response', async () => {
    let resolvePromise!: (value: unknown) => void;
    mockUpdateBank.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useUpdateEventOrganizerBank());

    let mutationPromise!: Promise<unknown>;
    await act(async () => {
      mutationPromise = result.current.mutate({ eoId: 'eo-1', payload });
      await Promise.resolve();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockUpdateBank).toHaveBeenCalledWith('eo-1', payload);

    const mockResponse = { id: 'eo-1', status: 'updated' };
    await act(async () => {
      resolvePromise(mockResponse);
      const res = await mutationPromise;
      expect(res).toEqual(mockResponse);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets Error message on Error rejection, uses fallback for non-Error rejection, and clears error on retry', async () => {
    mockUpdateBank.mockRejectedValueOnce(new Error('Invalid account number'));
    const { result } = renderHook(() => useUpdateEventOrganizerBank());

    await act(async () => {
      await expect(
        result.current.mutate({ eoId: 'eo-1', payload })
      ).rejects.toThrow('Invalid account number');
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Invalid account number');

    mockUpdateBank.mockRejectedValueOnce('unexpected failure');
    await act(async () => {
      await expect(
        result.current.mutate({ eoId: 'eo-1', payload })
      ).rejects.toBe('unexpected failure');
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Failed to update bank information');

    mockUpdateBank.mockResolvedValueOnce({ id: 'eo-1' });
    await act(async () => {
      await result.current.mutate({ eoId: 'eo-1', payload });
    });

    expect(result.current.error).toBeNull();
  });
});
