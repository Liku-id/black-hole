import useSWR from 'swr';

import { transactionsService } from '@/services';
import { TransactionSummary } from '@/types/transaction';

interface UseTransactionSummaryReturn {
  summary: TransactionSummary | null;
  loading: boolean;
  error: any;
}

export const useTransactionSummary = (
  eventId: string
): UseTransactionSummaryReturn => {
  const { data, error, isLoading } = useSWR<TransactionSummary>(
    eventId ? `/api/transactions/${eventId}/summary` : null,
    () => transactionsService.getTransactionSummary(eventId)
  );

  return {
    summary: data || null,
    loading: isLoading,
    error
  };
};
