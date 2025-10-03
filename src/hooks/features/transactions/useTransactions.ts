import { useApi } from '@/hooks/useApi';
import { transactionsService } from '@/services';
import { TransactionsResponse, TransactionsFilters } from '@/types/transaction';

interface UseEventTransactionsReturn {
  transactions: any[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const useTransactions = (
  eventId?: string,
  filters?: TransactionsFilters
): UseEventTransactionsReturn => {
  const { data, error, mutate } = useApi<TransactionsResponse>(
    eventId
      ? ['/api/transactions', eventId, filters?.page, filters?.limit]
      : null,
    () => transactionsService.getEventTransactions(eventId!, filters)
  );

  return {
    transactions: data?.transactions || [],
    loading: !data && !error,
    error: error,
    mutate,
    total: data?.pagination?.totalItems || 0,
    totalPages: data?.pagination?.totalPages || 0,
    currentPage:
      data?.pagination?.currentPage !== undefined
        ? data.pagination.currentPage - 1
        : 0,
    pageSize: data?.pagination?.limit || 10,
    hasNext: data?.pagination?.hasNext || false,
    hasPrev: data?.pagination?.hasPrev || false
  };
};

export { useTransactions };
