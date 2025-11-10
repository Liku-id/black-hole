import { eventsService } from '@/services';
import { EventsFilters } from '@/types/event';
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

  const temp = data?.body?.data || [];

  // Guard limit 2
  const limitedEvents = temp.slice(0, 2);

  // Mapping
  const mappedEvents = limitedEvents.map((item) => ({
    id: item.id,
    name: item.name,
    metaUrl: item.metaUrl,
    address: item.address,
    date: item.startDate,
    time: item.startDate,
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
