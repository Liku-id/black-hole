import useSWR from 'swr';

import {
  withdrawalService,
  EventOrganizerSummaryResponse
} from '@/services/withdrawal';

export const useEventOrganizerSummary = () => {
  const { data, error, isLoading, mutate } =
    useSWR<EventOrganizerSummaryResponse>(
      '/api/withdrawal/event-organizer/summary',
      () => withdrawalService.getEventOrganizerSummary(),
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
