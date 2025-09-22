import { ticketsService } from '@/services';
import { Ticket, TicketsFilters } from '@/types/ticket';

import { useApi } from '../../useApi';

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  total: number;
  totalPage: number;
  currentPage: number;
  currentShow: number;
}

const useTickets = (filters: TicketsFilters | null): UseTicketsReturn => {
  const { data, loading, error, mutate } = useApi(
    filters ? ['/api/tickets', filters] : null,
    () => (filters ? ticketsService.getTickets(filters) : Promise.resolve(null))
  );

  return {
    tickets: data?.body?.tickets || [],
    loading,
    error,
    mutate,
    total:
      typeof data?.body?.total === 'string'
        ? parseInt(data.body.total)
        : data?.body?.total || 0,
    totalPage: data?.body?.totalPage || 0,
    currentPage: data?.body?.page || 0,
    currentShow: data?.body?.show || 10
  };
};

export { useTickets };
