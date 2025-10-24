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
      const response = await withdrawalService.getWithdrawalHistory(
        eventId,
        eventOrganizerId
      );
      setWithdrawals(response.body);
    } catch (err) {
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
