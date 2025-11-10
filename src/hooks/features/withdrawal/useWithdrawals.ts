import { useApi } from '@/hooks/useApi';
import { withdrawalService } from '@/services/withdrawal';

interface UseWithdrawalsParams {
  status?: string;
  show?: number;
  page?: number;
}

export const useWithdrawals = (params?: UseWithdrawalsParams) => {
  const { data, error, loading, mutate } = useApi(
    ['/api/withdrawal', params],
    () => withdrawalService.getWithdrawals(params)
  );

  return {
    withdrawals: data?.body?.data || [],
    loading: loading,
    error: error,
    mutate,
    pagination: data?.body?.pagination
  };
};
