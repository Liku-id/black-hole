import useSWR from 'swr';

import { transactionsService } from '@/services';
import { TransactionsResponse, TransactionsFilters } from '@/types/transaction';

interface UseEventTransactionsReturn {
  transactions: any[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const useTransactions = (
  filters: TransactionsFilters
): UseEventTransactionsReturn => {
  const { data, isLoading, error, mutate } = useSWR<TransactionsResponse>(
    filters.eventId ? ['/api/transactions', filters] : null,
    () => transactionsService.getEventTransactions(filters)
  );

  return {
    transactions: data?.transactions || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : typeof error === 'string' ? error : null,
    mutate,
    pagination: data?.pagination
  };
};

export { useTransactions };
