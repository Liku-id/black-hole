import eventsService from '@/services/eventsService';
import { Event, EventsFilters } from '@/types/event';
import useSWR from 'swr';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  total: number;
  totalPage: number;
  currentPage: number;
  currentShow: number;
}

const fetcher = async (filters?: EventsFilters) => {
  const response = await eventsService.getEvents(filters);
  return response;
};

export const useEvents = (filters?: EventsFilters): UseEventsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/events', filters],
    () => fetcher(filters),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      errorRetryCount: 3
    }
  );

  return {
    events: data?.body?.events || [],
    loading: isLoading,
    error: error?.message || null,
    mutate,
    total: parseInt(data?.body?.total || '0'),
    totalPage: data?.body?.totalPage || 0,
    currentPage: data?.body?.page || 1,
    currentShow: data?.body?.show || 10
  };
};
