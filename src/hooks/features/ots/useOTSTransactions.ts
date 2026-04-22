import useSWR from 'swr';

import { eventsService } from '@/services';
import { Transaction } from '@/types/transaction';

export function useOTSTransactions(eventId: string, cashierId?: string, params?: { page?: number; limit?: number }) {
  const { data: response, isLoading, error } = useSWR(
    eventId ? [`/api/transactions/${eventId}`, cashierId, params?.page, params?.limit] : null,
    () => eventsService.getOTSTransactions(eventId, { 
      cashier_id: cashierId,
      page: params?.page,
      limit: params?.limit
    })
  );

  const transactions: Transaction[] = response?.transactions || response?.body?.data || response?.data || [];

  return {
    transactions,
    loading: isLoading,
    error,
    pagination: response?.body?.pagination || response?.pagination
  };
}
