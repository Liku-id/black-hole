import eventsService from '@/services/eventsService';
import { EventDetail } from '@/types/event';
import { useApi } from '../../common/useApi';

interface UseEventDetailReturn {
  eventDetail: EventDetail | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useEventDetail = (metaUrl: string): UseEventDetailReturn => {
  const { data, loading, error, mutate } = useApi(
    metaUrl ? [`/api/events/${metaUrl}`, metaUrl] : null,
    () => eventsService.getEventDetail(metaUrl)
  );

  return {
    eventDetail: data?.body || null,
    loading,
    error,
    mutate
  };
};

export default useEventDetail;
