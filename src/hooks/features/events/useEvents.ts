import eventsService from '@/services/eventsService';
import { Event, EventsFilters } from '@/types/event';
import { useApi } from '../../common/useApi';

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

const useEvents = (filters?: EventsFilters): UseEventsReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/events', filters],
    () => eventsService.getEvents(filters)
  );

  return {
    events: data?.body?.events || [],
    loading,
    error,
    mutate,
    total: parseInt(data?.body?.total || '0'),
    totalPage: data?.body?.totalPage || 0,
    currentPage: data?.body?.page || 1,
    currentShow: data?.body?.show || 10
  };
};

export default useEvents;
