import cityService from '@/services/cityService';
import { City } from '@/types/city';
import { useApi } from './useApi';

interface UseCitiesReturn {
  cities: City[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

export const useCities = (): UseCitiesReturn => {
  const { data, loading, error, mutate } = useApi(
    '/api/cities',
    () => cityService.getCities(),
    {
      refreshInterval: 300000, // Refresh every 5 minutes (cities don't change often)
      revalidateOnFocus: false,
      errorRetryCount: 3
    }
  );

  return {
    cities: data?.body || [],
    loading,
    error,
    mutate
  };
};
