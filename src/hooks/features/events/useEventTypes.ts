import { eventTypesService } from '@/services';
import { EventTypesResponse } from '@/types/event';

import { useApi } from '../../useApi';

export const useEventTypes = () => {
  const { data, loading, error, mutate } = useApi<EventTypesResponse>(
    '/api/event-types',
    () => eventTypesService.getEventTypes()
  );

  return {
    eventTypes: data?.eventTypes || [],
    loading,
    error,
    refetch: mutate
  };
};
