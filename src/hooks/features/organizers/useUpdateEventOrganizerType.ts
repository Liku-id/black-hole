import { useState } from 'react';

import {
  eventOrganizerService,
  UpdateOrganizerTypePayload
} from '@/services/event-organizer';

interface UseUpdateEventOrganizerTypeReturn {
  mutate: (params: {
    eoId: string;
    payload: UpdateOrganizerTypePayload;
  }) => Promise<any>;
  isPending: boolean;
  error: string | null;
}

export const useUpdateEventOrganizerType =
  (): UseUpdateEventOrganizerTypeReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = async ({
      eoId,
      payload
    }: {
      eoId: string;
      payload: UpdateOrganizerTypePayload;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await eventOrganizerService.updateEventOrganizerType(
          eoId,
          payload
        );
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update organizer type';
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
