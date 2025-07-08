import { ApiError } from '@/api/error';
import { organizersApi } from '@/api/organizers';
import { EventOrganizer } from '@/models/organizer';
import { useCallback, useEffect, useState } from 'react';

interface UseEventOrganizersReturn {
  eventOrganizers: EventOrganizer[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useEventOrganizers = (): UseEventOrganizersReturn => {
  const [eventOrganizers, setEventOrganizers] = useState<EventOrganizer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventOrganizers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await organizersApi.getEventOrganizers();
      setEventOrganizers(response.body.eventOrganizers);
    } catch (err) {
      console.error('Error fetching event organizers:', err);
      if (err instanceof ApiError) {
        setError(`Error ${err.code}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchEventOrganizers();
  }, [fetchEventOrganizers]);

  useEffect(() => {
    fetchEventOrganizers();
  }, [fetchEventOrganizers]);

  return {
    eventOrganizers,
    loading,
    error,
    refresh
  };
};
