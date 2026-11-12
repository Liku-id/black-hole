import { act, renderHook } from '@testing-library/react';

import {
  eventOrganizerService,
  UpdateGeneralPayload
} from '@/services/event-organizer';

import { useUpdateEventOrganizerGeneral } from './useUpdateEventOrganizerGeneral';

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    updateEventOrganizerGeneral: jest.fn()
  }
}));

const mockUpdateGeneral =
  eventOrganizerService.updateEventOrganizerGeneral as jest.Mock;

describe('useUpdateEventOrganizerGeneral', () => {
  const payload: UpdateGeneralPayload = {
    name: 'Wukong Organizer',
    description: 'Updated description',
    address: 'Jakarta'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('has initial idle state', () => {
    const { result } = renderHook(() => useUpdateEventOrganizerGeneral());

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('tracks pending state and returns response on success', async () => {
    let resolvePromise!: (value: unknown) => void;
    mockUpdateGeneral.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useUpdateEventOrganizerGeneral());

    let mutationPromise!: Promise<unknown>;
    await act(async () => {
      mutationPromise = result.current.mutate({ eoId: 'eo-1', payload });
      await Promise.resolve();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockUpdateGeneral).toHaveBeenCalledWith('eo-1', payload);

    const mockResponse = { id: 'eo-1', name: 'Wukong Organizer' };
    await act(async () => {
      resolvePromise(mockResponse);
      const res = await mutationPromise;
      expect(res).toEqual(mockResponse);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles Error and non-Error rejections and clears error on subsequent success', async () => {
    mockUpdateGeneral.mockRejectedValueOnce(new Error('Validation error'));
    const { result } = renderHook(() => useUpdateEventOrganizerGeneral());

    await act(async () => {
      await expect(
        result.current.mutate({ eoId: 'eo-1', payload })
      ).rejects.toThrow('Validation error');
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Validation error');

    mockUpdateGeneral.mockRejectedValueOnce({ status: 500 });
    await act(async () => {
      await expect(
        result.current.mutate({ eoId: 'eo-1', payload })
      ).rejects.toEqual({ status: 500 });
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Failed to update organizer');

    mockUpdateGeneral.mockResolvedValueOnce({ id: 'eo-1' });
    await act(async () => {
      await result.current.mutate({ eoId: 'eo-1', payload });
    });

    expect(result.current.error).toBeNull();
  });
});
