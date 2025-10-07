import { transactionsService } from '@/services/transactions';
import { ExportTransactionsRequest } from '@/types/transaction';
import { useState } from 'react';

interface UseExportTransactionsReturn {
  exportData: (request: ExportTransactionsRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
  downloadCSV: (csvContent: string, filename: string) => void;
}

export const useExportTransactions = (): UseExportTransactionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadCSV = (csvContent: string, filename: string) => {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('Failed to download CSV file');
    }
  };

  const exportData = async (request: ExportTransactionsRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await transactionsService.exportTransactions(request);

      if (response.body?.csv_content && response.body?.csv_filename) {
        downloadCSV(response.body.csv_content, response.body.csv_filename);
      } else {
        setError('No data available for export');
      }
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err?.message || 'Failed to export transactions');
    } finally {
      setLoading(false);
    }
  };

  return {
    exportData,
    loading,
    error,
    downloadCSV
  };
};
