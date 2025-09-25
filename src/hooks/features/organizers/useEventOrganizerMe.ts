import { eventOrganizerService } from '@/services/event-organizer';
import { EventOrganizer } from '@/types/organizer';

import { useApi } from '../../useApi';

interface UseEventOrganizerMeReturn {
  data: EventOrganizer | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useEventOrganizerMe = (enabled: boolean = true): UseEventOrganizerMeReturn => {
  const { data, loading, error, mutate } = useApi(
    enabled ? ['/api/event-organizers/me'] : null,
    () => eventOrganizerService.getEventOrganizerMe()
  );

  return {
    data: data?.body || null,
    loading,
    error,
    mutate
  };
};

export { useEventOrganizerMe };
