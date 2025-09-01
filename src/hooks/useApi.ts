import useSWR, { SWRConfiguration } from 'swr';

interface UseApiReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

export const useApi = <T>(
  key: string | string[] | (string | any)[] | null,
  fetcher: () => Promise<T>,
  options?: SWRConfiguration
): UseApiReturn<T> => {
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    errorRetryCount: 3,
    ...options
  });

  return {
    data,
    loading: isLoading,
    error: error?.message || null,
    mutate
  };
};
