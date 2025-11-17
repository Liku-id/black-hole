import { eventOrganizerService } from '@/services/event-organizer';
import {
  EventOrganizer,
  ListEventOrganizersRequest,
  ListEventOrganizersResponse
} from '@/types/organizer';

import { useApi } from '../../useApi';

interface UseEventOrganizersReturn {
  eventOrganizers: EventOrganizer[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: {
    show: number;
    page: number;
    total: number;
    totalPage: number;
  } | null;
}

const useEventOrganizers = (
  filters?: ListEventOrganizersRequest
): UseEventOrganizersReturn => {
  const { data, loading, error, mutate } = useApi<ListEventOrganizersResponse>(
    ['/api/organizers', filters],
    () => eventOrganizerService.getAllEventOrganizers(filters)
  );

  return {
    eventOrganizers: data?.body?.eventOrganizers || [],
    loading,
    error,
    mutate,
    pagination: data?.body
      ? {
          show: data.body.show,
          page: data.body.page,
          total: data.body.total,
          totalPage: data.body.totalPage
        }
      : null
  };
};

export { useEventOrganizers };

