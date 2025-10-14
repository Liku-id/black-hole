import { useState } from 'react';
import { ticketsService } from '@/services/tickets';

interface UseExportTicketsReturn {
  exportTickets: (eventId: string, eventName?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useExportTickets = (): UseExportTicketsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportTickets = async (eventId: string, eventName?: string) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await ticketsService.exportTickets(eventId, eventName);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err?.message || 'Failed to export tickets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    exportTickets,
    loading,
    error
  };
};
