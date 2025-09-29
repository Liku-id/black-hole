import useSWR from 'swr';

import {
  withdrawalService,
  EventOrganizerSummaryResponse
} from '@/services/withdrawal';

export const useEventOrganizerSummary = (eventOrganizerId?: string | null) => {
  const { data, error, isLoading, mutate } =
    useSWR<EventOrganizerSummaryResponse>(
      eventOrganizerId 
        ? `/api/withdrawal/event-organizer/summary?eventOrganizerId=${eventOrganizerId}` 
        : '/api/withdrawal/event-organizer/summary',
      () => withdrawalService.getEventOrganizerSummary(eventOrganizerId),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: true
      }
    );

  return {
    summary: data?.body || null,
    loading: isLoading,
    error: error?.message || null,
    mutate
  };
};
