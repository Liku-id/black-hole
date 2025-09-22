import { useState } from 'react';
import { eventOrganizerService, UpdateLegalPayload } from '@/services/event-organizer';

interface UseUpdateEventOrganizerLegalReturn {
  mutate: (params: { eoId: string; payload: UpdateLegalPayload }) => Promise<any>;
  isPending: boolean;
  error: string | null;
}

export const useUpdateEventOrganizerLegal = (): UseUpdateEventOrganizerLegalReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async ({ eoId, payload }: { eoId: string; payload: UpdateLegalPayload }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventOrganizerService.updateEventOrganizerLegal(eoId, payload);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update legal information';
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
