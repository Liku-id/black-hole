import { partnersService, GetPartnersFilters } from '@/services/partners';
import { useApi } from '../../useApi';
import { Pagination } from '@/types/event';

interface UsePartnersReturn {
  partners: any[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
  pagination: Pagination | undefined;
}

const usePartners = (filters: GetPartnersFilters | null): UsePartnersReturn => {
  const { data, loading, error, mutate } = useApi(
    filters ? ['/api/partners', filters] : null,
    () =>
      filters ? partnersService.getPartners(filters) : Promise.resolve(null)
  );

  return {
    partners: data?.body?.data || [],
    loading,
    error,
    mutate,
    pagination: data?.body?.pagination
  };
};

export { usePartners };
