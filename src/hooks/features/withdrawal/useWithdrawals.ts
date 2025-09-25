import useSWR from 'swr';

import {
  withdrawalService,
  WithdrawalListResponse
} from '@/services/withdrawal';

interface UseWithdrawalsParams {
  status?: string;
}

export const useWithdrawals = (params?: UseWithdrawalsParams) => {
  const { data, error, isLoading, mutate } =
    useSWR<WithdrawalListResponse>(
      params?.status ? `/api/withdrawal?status=${params.status}` : '/api/withdrawal',
      () => withdrawalService.getWithdrawals(params?.status),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: true
      }
    );

  return {
    withdrawals: data?.body || [],
    loading: isLoading,
    error: error?.message || null,
    mutate
  };
};
