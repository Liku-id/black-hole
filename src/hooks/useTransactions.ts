import useSWR from 'swr';
import { TransactionsFilters, TransactionsResponse } from '@/types/transaction';
import transactionsService from '@/services/transactionsService';

interface UseTransactionsReturn {
  data: TransactionsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const fetcher = async (eventId: string, filters?: TransactionsFilters) => {
  const response = await transactionsService.getEventTransactions(
    eventId,
    filters
  );
  return response;
};

export const useTransactions = (
  eventId: string,
  filters?: TransactionsFilters
): UseTransactionsReturn => {
  const { data, error, isLoading, mutate } = useSWR(
    eventId ? ['/api/transactions', eventId, filters] : null,
    () => fetcher(eventId, filters),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      errorRetryCount: 3
    }
  );

  return {
    data: data || null,
    isLoading,
    error: error?.message || null,
    refetch: mutate
  };
};
