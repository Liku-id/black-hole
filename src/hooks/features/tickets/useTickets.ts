import { ticketsService } from '@/services';
import { Pagination } from '@/types/event';
import { Ticket, TicketsFilters } from '@/types/ticket';

import { useApi } from '../../useApi';

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: Pagination;
  stats: {
    totalIssued: number;
    totalRedeem: number;
    totalTicket: number;
  };
}

const useTickets = (filters: TicketsFilters | null): UseTicketsReturn => {
  const { data, loading, error, mutate } = useApi(
    filters ? ['/api/tickets', filters] : null,
    () =>
      filters.eventId
        ? ticketsService.getTickets(filters)
        : Promise.resolve(null)
  );

  return {
    tickets: data?.body?.data || [],
    loading,
    error,
    mutate,
    pagination: data?.body?.pagination,
    stats: data?.body?.stats
  };
};

export { useTickets };
