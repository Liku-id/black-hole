import { partnerTicketTypesService, GetPartnerTicketTypesFilters } from '@/services/partner-ticket-types';
import { Pagination } from '@/types/event';

import { useApi } from '../../useApi';

interface UsePartnerTicketTypesReturn {
  partnerTicketTypes: any[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: Pagination | undefined;
}

const usePartnerTicketTypes = (
  filters: GetPartnerTicketTypesFilters | null
): UsePartnerTicketTypesReturn => {
  const { data, loading, error, mutate } = useApi(
    filters ? ['/api/partner-ticket-types', filters] : null,
    () =>
      filters
        ? partnerTicketTypesService.getPartnerTicketTypes(filters)
        : Promise.resolve(null)
  );

  return {
    partnerTicketTypes: data?.body?.data || [],
    loading,
    error,
    mutate,
    pagination: data?.body?.pagination
  };
};

export { usePartnerTicketTypes };

