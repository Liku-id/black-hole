import organizersService from '@/services/organizersService';
import { EventOrganizer } from '@/types/organizer';
import { useApi } from '../../common/useApi';

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
      const response = await organizersService.getEventOrganizers();
      return response.body.eventOrganizers;
    }
  );

  return {
    organizers: data || [],
    loading,
    error,
    mutate,
  };
};

export default useOrganizers;
