import ticketsService from '@/services/ticketsService';
import { Ticket, TicketsFilters } from '@/types/ticket';
import useSWR from 'swr';

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

const fetcher = async (filters: TicketsFilters) => {
  const response = await ticketsService.getTickets(filters);
  return response;
};

export const useTickets = (filters: TicketsFilters): UseTicketsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/tickets', filters],
    () => fetcher(filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      errorRetryCount: 3
    }
  );

  return {
    tickets: data?.body?.tickets || [],
    loading: isLoading,
    error: error?.message || null,
    mutate,
    total: parseInt(data?.body?.total || '0'),
    totalPage: data?.body?.totalPage || 0,
    currentPage: data?.body?.page || 0,
    currentShow: data?.body?.show || 10
  };
};
