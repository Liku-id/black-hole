import { useState } from 'react';
import { eventOrganizerService, UpdateBankPayload } from '@/services/event-organizer';

interface UseUpdateEventOrganizerBankReturn {
  mutate: (params: { eoId: string; payload: UpdateBankPayload }) => Promise<any>;
  isPending: boolean;
  error: string | null;
}

export const useUpdateEventOrganizerBank = (): UseUpdateEventOrganizerBankReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async ({ eoId, payload }: { eoId: string; payload: UpdateBankPayload }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventOrganizerService.updateEventOrganizerBank(eoId, payload);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bank information';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    isPending: loading,
    error
  };
};
