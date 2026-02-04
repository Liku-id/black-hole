import { useAuth } from '@/contexts/AuthContext';
import {
  withdrawalService,
  WithdrawalHistoryItem,
  PaginationFilters
} from '@/services/withdrawal';
import { Pagination } from '@/types/event';

import { useApi } from '../../useApi';

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
    error: error ?? null,
    mutate,
    pagination: data?.body?.pagination
  };
};
