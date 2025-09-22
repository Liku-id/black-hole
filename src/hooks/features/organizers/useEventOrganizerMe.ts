import { authService } from '@/services';
import { EventOrganizer } from '@/types/organizer';

import { useApi } from '../../useApi';

interface UseEventOrganizerMeReturn {
  eventOrganizer: EventOrganizer | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useEventOrganizerMe = (): UseEventOrganizerMeReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/event-organizers/me'],
    () => authService.getEventOrganizerMe()
  );

  return {
    eventOrganizer: data?.body || null,
    loading,
    error,
    mutate
  };
};

export { useEventOrganizerMe };

