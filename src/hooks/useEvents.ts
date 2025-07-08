import { ApiError } from '@/api/error';
import { eventsApi } from '@/api/events';
import { Event } from '@/models/event';
import { useCallback, useEffect, useState } from 'react';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsApi.getEvents();
      setEvents(response.body.events);
    } catch (err) {
      console.error('Error fetching events:', err);
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
    await fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refresh
  };
};
