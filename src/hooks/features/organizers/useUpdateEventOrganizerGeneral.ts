import { useState } from 'react';

import {
  eventOrganizerService,
  UpdateGeneralPayload
} from '@/services/event-organizer';

interface UseUpdateEventOrganizerGeneralReturn {
  mutate: (params: {
    eoId: string;
    payload: UpdateGeneralPayload;
  }) => Promise<any>;
  isPending: boolean;
  error: string | null;
}

export const useUpdateEventOrganizerGeneral =
  (): UseUpdateEventOrganizerGeneralReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = async ({
      eoId,
      payload
    }: {
      eoId: string;
      payload: UpdateGeneralPayload;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await eventOrganizerService.updateEventOrganizerGeneral(
            eoId,
            payload
          );
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update organizer';
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
