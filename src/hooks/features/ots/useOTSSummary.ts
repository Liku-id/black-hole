import useSWR from 'swr';

import { eventsService } from '@/services';
import { formatUtils } from '@/utils/formatUtils';

export function useOTSSummary(eventId: string) {
  const { data: response, isLoading, error } = useSWR(
    eventId ? `/api/ots/summary?eventId=${eventId}` : null,
    () => eventsService.getOTSSummary(eventId)
  );

  const otsSummary = response?.body || response?.data;
  const summary = otsSummary ? {
    totalRevenue: formatUtils.formatCurrency(Number(otsSummary.totalRevenue || 0)),
    ticketSold: formatUtils.formatNumber(Number(otsSummary.ticketSold || 0)),
    totalTransaction: formatUtils.formatNumber(Number(otsSummary.totalTransaction || 0)),
    totalVisitors: formatUtils.formatNumber(Number(otsSummary.totalVisitors || 0)),
  } : undefined;

  return {
    summary,
    loading: isLoading,
    error
  };
}
