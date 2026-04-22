import { ticketsService } from '@/services/tickets';
import { TicketType } from '@/types/event';

import { useApi } from '../../useApi';

interface UseTicketTypesByEventReturn {
  ticketTypes: TicketType[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useTicketTypesByEvent = (eventId: string | null): UseTicketTypesByEventReturn => {
  const { data, loading, error, mutate } = useApi(
    eventId ? [`/api/tickets/ticket-types/event/${eventId}`] : null,
    () => (eventId ? ticketsService.getTicketTypesByEvent(eventId) : Promise.resolve([]))
  );

  return {
    ticketTypes: Array.isArray(data) ? data : [],
    loading,
    error,
    mutate
  };
};

export { useTicketTypesByEvent };
