import { eventOrganizerService } from '@/services/event-organizer';
import { EventOrganizer } from '@/types/organizer';

import { useApi } from '../../useApi';

interface UseEventOrganizerMeReturn {
  data: EventOrganizer | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useEventOrganizerMe = (): UseEventOrganizerMeReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/event-organizers/me'],
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
