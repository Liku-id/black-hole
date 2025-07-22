import eventsService from '@/services/eventsService';
import { EventDetail } from '@/types/event';
import useSWR from 'swr';

interface UseEventDetailReturn {
  eventDetail: EventDetail | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const fetcher = async (metaUrl: string) => {
  const response = await eventsService.getEventDetail(metaUrl);
  return response;
};

export const useEventDetail = (metaUrl: string): UseEventDetailReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    metaUrl ? [`/api/events/${metaUrl}`, metaUrl] : null,
    () => fetcher(metaUrl),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      errorRetryCount: 3
    }
  );

  return {
    eventDetail: data?.body || null,
    loading: isLoading,
    error: error?.message || null,
    mutate
  };
};
