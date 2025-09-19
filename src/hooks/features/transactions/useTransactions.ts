import { useApi } from '@/hooks/useApi';
import { transactionsService } from '@/services';
import { TransactionsResponse } from '@/types/transaction';

interface UseEventTransactionsReturn {
  transactions: any[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useTransactions = (eventId?: string): UseEventTransactionsReturn => {
  const { data, error, mutate } = useApi<TransactionsResponse>(
    eventId ? ['/api/transactions', eventId] : null,
    () => transactionsService.getEventTransactions(eventId!)
  );

  return {
    transactions: data?.transactions || [],
    loading: !data && !error,
    error: error,
    mutate
  };
};

export { useTransactions };
