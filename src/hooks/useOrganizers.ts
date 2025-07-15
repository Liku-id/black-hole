import organizersService from '@/services/organizersService';
import { EventOrganizer } from '@/types/organizer';
import useSWR from 'swr';

interface UseOrganizersReturn {
  organizers: EventOrganizer[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const fetcher = async (): Promise<EventOrganizer[]> => {
  const response = await organizersService.getEventOrganizers();
  return response.body.eventOrganizers;
};

export const useOrganizers = (): UseOrganizersReturn => {
  const { data, error, isLoading, mutate } = useSWR('/api/organizers', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    errorRetryCount: 3,
  });

  return {
    organizers: data || [],
    loading: isLoading,
    error: error?.message || null,
    mutate,
  };
};
