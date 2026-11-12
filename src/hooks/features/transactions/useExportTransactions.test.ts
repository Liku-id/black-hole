import { act, renderHook } from '@testing-library/react';

import { transactionsService } from '@/services/transactions';
import { ExportTransactionsRequest } from '@/types/transaction';

import { useExportTransactions } from './useExportTransactions';

jest.mock('@/services/transactions', () => ({
  transactionsService: {
    exportTransactions: jest.fn()
  }
}));

const mockExportTransactions =
  transactionsService.exportTransactions as jest.Mock;

describe('useExportTransactions', () => {
  const request: ExportTransactionsRequest = {
    from_date: '2026-01-01',
    to_date: '2026-01-31',
    payment_status: 'paid',
    event_id: 'event-1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('has initial idle state', () => {
    const { result } = renderHook(() => useExportTransactions());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.exportData).toBe('function');
  });

  it('exports transactions and prevents concurrent export calls while loading', async () => {
    let resolveExport!: () => void;
    mockExportTransactions.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveExport = resolve;
        })
    );

    const { result } = renderHook(() => useExportTransactions());

    let pendingExport!: Promise<void>;
    await act(async () => {
      pendingExport = result.current.exportData(request, 'Wukong Fest');
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockExportTransactions).toHaveBeenCalledTimes(1);
    expect(mockExportTransactions).toHaveBeenCalledWith(request, 'Wukong Fest');

    // Concurrent call returns immediately while loading
    await act(async () => {
      await result.current.exportData(request);
    });
    expect(mockExportTransactions).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveExport();
      await pendingExport;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles Error and non-Error failures, logs console.error, and resets error on retry', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const err = new Error('Export timed out');
    mockExportTransactions.mockRejectedValueOnce(err);

    const { result } = renderHook(() => useExportTransactions());

    await act(async () => {
      await expect(result.current.exportData(request)).rejects.toThrow(
        'Export timed out'
      );
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Export error:', err);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Export timed out');

    mockExportTransactions.mockRejectedValueOnce('unknown error');

    await act(async () => {
      await expect(result.current.exportData(request)).rejects.toBe(
        'unknown error'
      );
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Export error:',
      'unknown error'
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to export transactions');

    mockExportTransactions.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.exportData(request);
    });

    expect(result.current.error).toBeNull();
  });
});
