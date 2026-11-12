import { act, renderHook } from '@testing-library/react';

import {
  eventOrganizerService,
  UpdateLegalPayload
} from '@/services/event-organizer';

import { useUpdateEventOrganizerLegal } from './useUpdateEventOrganizerLegal';

jest.mock('@/services/event-organizer', () => ({
  eventOrganizerService: {
    updateEventOrganizerLegal: jest.fn()
  }
}));

const mockUpdateLegal =
  eventOrganizerService.updateEventOrganizerLegal as jest.Mock;

describe('useUpdateEventOrganizerLegal', () => {
  const payload: UpdateLegalPayload = {
    npwp_number: '123456789012345',
    npwp_address: 'Jl. Sudirman',
    full_name: 'PT Wukong'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('has initial idle state', () => {
    const { result } = renderHook(() => useUpdateEventOrganizerLegal());

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.mutate).toBe('function');
  });

  it('tracks pending state and returns response on success', async () => {
    let resolvePromise!: (value: unknown) => void;
    mockUpdateLegal.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() => useUpdateEventOrganizerLegal());

    let mutationPromise!: Promise<unknown>;
    await act(async () => {
      mutationPromise = result.current.mutate({ eoId: 'eo-1', payload });
      await Promise.resolve();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockUpdateLegal).toHaveBeenCalledWith('eo-1', payload);

    const mockResponse = { id: 'eo-1' };
    await act(async () => {
      resolvePromise(mockResponse);
      const res = await mutationPromise;
      expect(res).toEqual(mockResponse);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles Error and non-Error rejections and resets error on retry', async () => {
    mockUpdateLegal.mockRejectedValueOnce(new Error('Invalid NPWP'));
    const { result } = renderHook(() => useUpdateEventOrganizerLegal());

    await act(async () => {
      await expect(
        result.current.mutate({ eoId: 'eo-1', payload })
      ).rejects.toThrow('Invalid NPWP');
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Invalid NPWP');

    mockUpdateLegal.mockRejectedValueOnce(null);
    await act(async () => {
      await expect(
        result.current.mutate({ eoId: 'eo-1', payload })
      ).rejects.toBeNull();
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe('Failed to update legal information');

    mockUpdateLegal.mockResolvedValueOnce({ id: 'eo-1' });
    await act(async () => {
      await result.current.mutate({ eoId: 'eo-1', payload });
    });

    expect(result.current.error).toBeNull();
  });
});
