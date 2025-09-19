import useSWR from 'swr';

import {
  withdrawalService,
  WithdrawalSummariesResponse
} from '@/services/withdrawal';

export const useWithdrawalSummaries = () => {
  const { data, error, isLoading, mutate } =
    useSWR<WithdrawalSummariesResponse>(
      '/api/withdrawal/summaries',
      () => withdrawalService.getSummaries(),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: true
      }
    );

  return {
    summaries: data?.body || [],
    loading: isLoading,
    error: error?.message || null,
    mutate
  };
};
