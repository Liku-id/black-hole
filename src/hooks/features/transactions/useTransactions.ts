import { transactionsService } from '@/services';
import { TransactionsFilters, TransactionsResponse } from '@/types/transaction';

import { useApi } from '../../useApi';

interface UseTransactionsReturn {
  data: TransactionsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useTransactions = (
  eventId: string,
  filters?: TransactionsFilters
): UseTransactionsReturn => {
  const { data, loading, error, mutate } = useApi(
    eventId ? ['/api/transactions', eventId, filters] : null,
    () => transactionsService.getEventTransactions(eventId, filters)
  );

  return {
    data: data || null,
    isLoading: loading,
    error,
    refetch: mutate
  };
};

export { useTransactions };
