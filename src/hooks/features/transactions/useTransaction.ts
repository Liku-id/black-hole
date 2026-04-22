import { useApi } from '@/hooks/useApi';
import { transactionsService } from '@/services/transactions';

export const useTransaction = (id: string | null, polling: boolean = false) => {
  const { data, loading, error, mutate } = useApi(
    id ? [`/api/transaction/${id}`, polling] : null,
    () => transactionsService.getTransactionDetails(id!),
    {
      refreshInterval: polling ? 5000 : 0, // Poll every 5 seconds if enabled
      revalidateOnFocus: true
    }
  );

  return {
    transaction: data?.body || null,
    loading,
    error,
    mutate
  };
};
