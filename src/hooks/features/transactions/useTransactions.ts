import { TransactionsFilters, TransactionsResponse } from '@/types/transaction';
import transactionsService from '@/services/transactionsService';
import { useApi } from '../../common/useApi';

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

export default useTransactions;
