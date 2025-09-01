import { apiUtils } from '@/utils/apiUtils';

import { useApi } from '../useApi';

interface City {
  id: string;
  name: string;
}

interface CitiesResponse {
  statusCode: number;
  message: string;
  body: City[];
}

export const useCities = () => {
  const { data, loading, error } = useApi<CitiesResponse>(
    '/api/list/cities',
    async () => {
      return await apiUtils.get<CitiesResponse>(
        '/api/list/cities',
        {},
        'Failed to fetch cities'
      );
    }
  );

  return {
    cities: data?.body || [],
    loading,
    error
  };
};
