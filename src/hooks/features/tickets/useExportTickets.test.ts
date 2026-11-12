import { act, renderHook } from '@testing-library/react';

import { ticketsService } from '@/services/tickets';

import { useExportTickets } from './useExportTickets';

jest.mock('@/services/tickets', () => ({
  ticketsService: {
    exportTickets: jest.fn()
  }
}));

const mockExportTickets = ticketsService.exportTickets as jest.Mock;

describe('useExportTickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('has initial idle state', () => {
    const { result } = renderHook(() => useExportTickets());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.exportTickets).toBe('function');
  });

  it('exports tickets with all parameters and guards against concurrent calls while loading', async () => {
    let resolveExport!: () => void;
    mockExportTickets.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveExport = resolve;
        })
    );

    const { result } = renderHook(() => useExportTickets());

    let pendingExport!: Promise<void>;
    await act(async () => {
      pendingExport = result.current.exportTickets(
        'event-1',
        'Music Fest',
        'tt-1,tt-2',
        'issued'
      );
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockExportTickets).toHaveBeenCalledTimes(1);
    expect(mockExportTickets).toHaveBeenCalledWith(
      'event-1',
      'Music Fest',
      'tt-1,tt-2',
      'issued'
    );

    // Concurrent call should return early while loading is true
    await act(async () => {
      await result.current.exportTickets('event-1');
    });
    expect(mockExportTickets).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveExport();
      await pendingExport;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles errors with and without message, logs console.error, and resets error on retry', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const errWithMessage = new Error('Export service unavailable');
    mockExportTickets.mockRejectedValueOnce(errWithMessage);

    const { result } = renderHook(() => useExportTickets());

    await act(async () => {
      await expect(
        result.current.exportTickets('event-1', undefined, undefined, '')
      ).rejects.toThrow('Export service unavailable');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Export error:',
      errWithMessage
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Export service unavailable');

    const errWithoutMessage = { code: 500 };
    mockExportTickets.mockRejectedValueOnce(errWithoutMessage);

    await act(async () => {
      await expect(result.current.exportTickets('event-1')).rejects.toEqual(
        errWithoutMessage
      );
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Export error:',
      errWithoutMessage
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to export tickets');

    mockExportTickets.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.exportTickets('event-1');
    });

    expect(result.current.error).toBeNull();
  });
});
