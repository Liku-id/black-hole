import { withdrawalService } from '@/services';
import { WithdrawalSummary } from '@/services/withdrawal';

import { useApi } from '../../useApi';

interface UseWithdrawalSummaryReturn {
  summary: WithdrawalSummary | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useWithdrawalSummary = (eventId?: string): UseWithdrawalSummaryReturn => {
  const { data, loading, error, mutate } = useApi(
    eventId && eventId.trim() !== ''
      ? ['/api/withdrawal/summary', eventId]
      : null,
    () =>
      eventId && eventId.trim() !== ''
        ? withdrawalService.getSummaryByEventId(eventId)
        : Promise.resolve(null)
  );

  return {
    summary: data?.body || null,
    loading,
    error,
    mutate
  };
};

export { useWithdrawalSummary };
