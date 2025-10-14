import { eventsService } from '@/services';
import { Event, EventsFilters } from '@/types/event';
import { useApi } from '../../useApi';

interface MappedEvent {
  id: string;
  name: string;
  metaUrl: string;
  address: string;
  date: string;
  time: string;
  totalRevenue: number;
  thumbnail: string;
}

interface UseFilteredEventsReturn {
  events: MappedEvent[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useFilteredEvents = (
  filters?: EventsFilters
): UseFilteredEventsReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/events', filters],
    () => eventsService.getEvents(filters)
  );

  // Sort by createdAt descending
  const sortedEvents =
    data?.body?.data?.sort(
      (a: Event, b: Event) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) || [];

  // Limit 2
  const limitedEvents = sortedEvents.slice(0, 2);

  // Mapping
  const mappedEvents = limitedEvents.map((item) => ({
    id: item.id,
    name: item.name,
    metaUrl: item.metaUrl,
    address: item.address,
    date: item.createdAt,
    time: item.createdAt,
    totalRevenue: Number(item.totalRevenue || '0'),
    thumbnail: item.eventAssets?.[0]?.asset?.url || ''
  }));

  return {
    events: mappedEvents,
    loading,
    error,
    mutate
  };
};

export { useFilteredEvents };
