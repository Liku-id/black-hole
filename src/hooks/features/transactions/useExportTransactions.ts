import { transactionsService } from '@/services/transactions';
import { ExportTransactionsRequest } from '@/types/transaction';
import { useState } from 'react';

interface UseExportTransactionsReturn {
  exportData: (request: ExportTransactionsRequest, eventName?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useExportTransactions = (): UseExportTransactionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = async (request: ExportTransactionsRequest, eventName?: string) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await transactionsService.exportTransactions(request, eventName);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err?.message || 'Failed to export transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    exportData,
    loading,
    error
  };
};
