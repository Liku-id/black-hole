import { useEffect, useState } from 'react';

import {
  withdrawalService,
  WithdrawalHistoryItem
} from '@/services/withdrawal';

export const useWithdrawalHistory = (
  eventId: string | undefined,
  eventOrganizerId: string | undefined
) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawalHistory = async () => {
    if (!eventOrganizerId) {
      setWithdrawals([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching withdrawal history with:', {
        eventId,
        eventOrganizerId
      });
      const response = await withdrawalService.getWithdrawalHistory(
        eventId,
        eventOrganizerId
      );
      console.log('Withdrawal history response:', response);
      setWithdrawals(response.body);
    } catch (err) {
      console.error('Failed to fetch withdrawal history:', err);
      setError('Failed to fetch withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalHistory();
  }, [eventId, eventOrganizerId]);

  return {
    withdrawals,
    loading,
    error,
    refetch: fetchWithdrawalHistory
  };
};
