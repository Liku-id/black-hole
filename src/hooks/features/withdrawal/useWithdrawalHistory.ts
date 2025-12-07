import {
  withdrawalService,
  WithdrawalHistoryItem,
  PaginationFilters
} from '@/services/withdrawal';

import { useApi } from '../../useApi';
import { Pagination } from '@/types/event';
import { useAuth } from '@/contexts/AuthContext';

interface UseWithdrawalHistoryReturn {
  withdrawals: WithdrawalHistoryItem[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: Pagination | undefined;
}

export const useWithdrawalHistory = (
  eventId: string | undefined,
  eventOrganizerId: string | undefined,
  filters?: PaginationFilters
): UseWithdrawalHistoryReturn => {
  // Get current user to include in cache key for user-specific caching
  const { user } = useAuth();
  const userId = user?.id || 'anonymous';

  const { data, loading, error, mutate } = useApi(
    ['/api/withdrawal/history', eventId, eventOrganizerId, filters, userId],
    () =>
      withdrawalService.getWithdrawalHistory(eventId, eventOrganizerId, filters)
  );

  return {
    withdrawals: data?.body?.data || [],
    loading,
    error,
    mutate,
    pagination: data?.body?.pagination
  };
};
