import cityService from '@/services/cityService';
import { City } from '@/types/city';
import useSWR from 'swr';

interface UseCitiesReturn {
  cities: City[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const fetcher = async () => {
  const response = await cityService.getCities();
  return response;
};

export const useCities = (): UseCitiesReturn => {
  const { data, error, isLoading, mutate } = useSWR('/api/cities', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes (cities don't change often)
    revalidateOnFocus: false,
    errorRetryCount: 3
  });

  return {
    cities: data?.body || [],
    loading: isLoading,
    error: error?.message || null,
    mutate
  };
};
