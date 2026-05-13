import { useApi } from '@/hooks/useApi';
import { eventsService } from '@/services/events';
import { Pagination, OTSApproval } from '@/types/event';

interface UseOTSApprovalsReturn {
  data: OTSApproval[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: Pagination;
}

const useOTSApprovals = (filters?: {
  status?: string;
  page?: number;
  limit?: number;
  event_id?: string;
}, enabled: boolean = true): UseOTSApprovalsReturn => {
  const { data, loading, error, mutate } = useApi(
    enabled ? ['/api/events/on-the-spot-sales', filters] : null,
    () => eventsService.getOTSApprovals(filters)
  );

  return {
    data: data?.body?.data || [],
    loading,
    error,
    mutate,
    pagination: data?.body?.pagination
  };
};

export { useOTSApprovals };
