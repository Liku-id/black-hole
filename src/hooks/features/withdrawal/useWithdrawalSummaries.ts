import useSWR from 'swr';

import {
  PaginationFilters,
  withdrawalService,
  WithdrawalSummariesResponse
} from '@/services/withdrawal';

export const useWithdrawalSummaries = (filters: PaginationFilters) => {
  const { data, error, isLoading, mutate } =
    useSWR<WithdrawalSummariesResponse>(
      ['/api/withdrawal/summary', filters],
      () => withdrawalService.getSummaries(filters),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: true
      }
    );

  return {
    summaries: data?.body?.data || [],
    loading: isLoading,
    error: error?.message || null,
    mutate,
    pagination: data?.body?.pagination || null
  };
};
