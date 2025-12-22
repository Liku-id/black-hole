import { useState } from 'react';
import { ticketsService } from '@/services/tickets';
import { TicketStatus } from '@/types/ticket';

interface UseExportTicketsReturn {
  exportTickets: (
    eventId: string,
    eventName?: string,
    ticketTypeIds?: string,
    ticketStatus?: TicketStatus | ''
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useExportTickets = (): UseExportTicketsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportTickets = async (
    eventId: string,
    eventName?: string,
    ticketTypeIds?: string,
    ticketStatus?: TicketStatus | ''
  ) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await ticketsService.exportTickets(
        eventId,
        eventName,
        ticketTypeIds,
        ticketStatus
      );
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
