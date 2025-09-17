import { useApi } from '@/hooks/useApi';
import { eventSubmissionsService } from '@/services/events-submissions';

interface UseEventsSubmissionDetailReturn {
  submission: any;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

export const useEventsSubmissionDetail = (
  id?: string
): UseEventsSubmissionDetailReturn => {
  const key = id ? ['/api/events-submissions/detail', id] : null;
  const { data, loading, error, mutate } = useApi(key, () =>
    eventSubmissionsService.getEventSubmissionDetail(id as string)
  );

  return {
    submission: data?.body,
    loading,
    error,
    mutate
  };
};
