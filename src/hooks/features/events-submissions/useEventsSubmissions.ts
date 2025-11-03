import { useApi } from '@/hooks/useApi';
import { eventSubmissionsService } from '@/services/events-submissions';
import { Pagination } from '@/types/event';
import { EventSubmissionsFilters } from '@/types/events-submission';

interface UseEventsSubmissionsReturn {
  submissions: any[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: Pagination;
}

const useEventsSubmissions = (
  filters?: EventSubmissionsFilters
): UseEventsSubmissionsReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/events-submissions', filters],
    () => eventSubmissionsService.getEventSubmissions(filters)
  );

  return {
    submissions: data?.body?.rows || [],
    loading,
    error,
    mutate,
    pagination: data?.body?.pagination
  };
};

export { useEventsSubmissions };
