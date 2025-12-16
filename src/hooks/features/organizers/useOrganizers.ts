import { eventOrganizerService } from '@/services/event-organizer';
import { EventOrganizer } from '@/types/organizer';

import { useApi } from '../../useApi';

interface UseOrganizersReturn {
  organizers: EventOrganizer[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useOrganizers = (): UseOrganizersReturn => {
  const { data, loading, error, mutate } = useApi(
    '/api/organizers',
    async () => {
      const response = await eventOrganizerService.getAllEventOrganizers();
      return response.body.eventOrganizers;
    }
  );

  return {
    organizers: data || [],
    loading,
    error,
    mutate
  };
};

export { useOrganizers };
