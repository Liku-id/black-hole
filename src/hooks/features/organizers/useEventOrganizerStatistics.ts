import { eventOrganizerService } from '@/services/event-organizer';
import { EventOrganizerStatistics } from '@/types/organizer';

import { useApi } from '../../useApi';

interface UseEventOrganizerStatisticsReturn {
  data: EventOrganizerStatistics | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useEventOrganizerStatistics = (
  eventOrganizerId?: string,
  enabled: boolean = true
): UseEventOrganizerStatisticsReturn => {
  const { data, loading, error, mutate } = useApi(
    enabled ? ['/api/event-organizers/statistics', eventOrganizerId] : null,
    () => eventOrganizerService.getEventOrganizerStatistics(eventOrganizerId)
  );

  return {
    data: data?.body || null,
    loading,
    error,
    mutate
  };
};

export { useEventOrganizerStatistics };

