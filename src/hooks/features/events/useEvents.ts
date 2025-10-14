import { eventsService } from '@/services';
import {
  Event,
  EventsFilters,
  EventCountByStatus,
  Pagination
} from '@/types/event';

import { useApi } from '../../useApi';

interface UseEventsReturn {
  events: Event[];
  eventCountByStatus: EventCountByStatus;
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: Pagination;
}

const useEvents = (filters?: EventsFilters): UseEventsReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/events', filters],
    () => eventsService.getEvents(filters)
  );

  return {
    events: data?.body?.data || [],
    eventCountByStatus: data?.body?.eventCountByStatus,
    loading,
    error,
    mutate,
    pagination: data?.body?.pagination
  };
};

export { useEvents };
