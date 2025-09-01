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

const useTickets = (filters: TicketsFilters): UseTicketsReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/tickets', filters],
    () => ticketsService.getTickets(filters)
  );

  return {
    tickets: data?.body?.tickets || [],
    loading,
    error,
    mutate,
    total: parseInt(data?.body?.total || '0'),
    totalPage: data?.body?.totalPage || 0,
    currentPage: data?.body?.page || 0,
    currentShow: data?.body?.show || 10
  };
};

export { useTickets };
