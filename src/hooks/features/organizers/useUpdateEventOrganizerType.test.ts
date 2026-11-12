import { act, renderHook } from '@testing-library/react';

import {
  eventOrganizerService,
  UpdateOrganizerTypePayload
} from '@/services/event-organizer';

import { useUpdateEventOrganizerType } from './useUpdateEventOrganizerType';

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    updateEventOrganizerType: jest.fn()
  }
}));

const mockUpdateType =
  eventOrganizerService.updateEventOrganizerType as jest.Mock;

describe('useUpdateEventOrganizerType', () => {
  const payload: UpdateOrganizerTypePayload = {
    organizer_type: 'institutional'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('has initial idle state', () => {
    const { result } = renderHook(() => useUpdateEventOrganizerType());

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('tracks pending state and resolves with service response', async () => {
    let resolvePromise!: (value: unknown) => void;
    mockUpdateType.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useUpdateEventOrganizerType());

    let mutationPromise!: Promise<unknown>;
    await act(async () => {
      mutationPromise = result.current.mutate({ eoId: 'eo-1', payload });
      await Promise.resolve();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockUpdateType).toHaveBeenCalledWith('eo-1', payload);

    const mockResponse = { id: 'eo-1', organizer_type: 'institutional' };
    await act(async () => {
      resolvePromise(mockResponse);
      const res = await mutationPromise;
      expect(res).toEqual(mockResponse);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles Error and non-Error rejections and clears error on retry', async () => {
    mockUpdateType.mockRejectedValueOnce(new Error('Type cannot be changed'));
    const { result } = renderHook(() => useUpdateEventOrganizerType());

    await act(async () => {
      await expect(
        result.current.mutate({ eoId: 'eo-1', payload })
      ).rejects.toThrow('Type cannot be changed');
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Type cannot be changed');

    mockUpdateType.mockRejectedValueOnce(422);
    await act(async () => {
      await expect(
        result.current.mutate({ eoId: 'eo-1', payload })
      ).rejects.toBe(422);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Failed to update organizer type');

    mockUpdateType.mockResolvedValueOnce({ id: 'eo-1' });
    await act(async () => {
      await result.current.mutate({ eoId: 'eo-1', payload });
    });

    expect(result.current.error).toBeNull();
  });
});
