import { useApi } from '@/hooks/useApi';
import { eventSubmissionsService } from '@/services/events-submissions';
import { EventSubmissionsFilters } from '@/types/events-submission';

interface UseEventsSubmissionsReturn {
  submissions: any[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  total: number;
  totalPage: number;
  currentPage: number;
  currentShow: number;
}

const useEventsSubmissions = (
  filters?: EventSubmissionsFilters
): UseEventsSubmissionsReturn => {
  const { data, loading, error, mutate } = useApi(
    ['/api/events-submissions', filters],
    () => eventSubmissionsService.getEventSubmissions(filters)
  );

  return {
    submissions: data?.body?.data || [],
    loading,
    error,
    mutate,
    total: data?.body?.pagination?.totalRecords || 0,
    totalPage: data?.body?.pagination?.totalPages || 0,
    currentPage: data?.body?.pagination?.page ?? 0,
    currentShow: data?.body?.pagination?.limit || 10
  };
};

export { useEventsSubmissions };
