import { ticketsService, AdditionalForm } from '@/services/tickets';
import { useApi } from '../../useApi';

interface UseDistinctAdditionalFormsReturn {
  distinctForms: AdditionalForm[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const useDistinctAdditionalForms = (eventId: string | null): UseDistinctAdditionalFormsReturn => {
  const { data, loading, error, mutate } = useApi(
    eventId ? [`/api/tickets/additional-forms/distinct/event/${eventId}`] : null,
    () => (eventId ? ticketsService.getDistinctAdditionalFormFields(eventId) : Promise.resolve(null))
  );

  return {
    distinctForms: data?.additionalForms || [],
    loading,
    error,
    mutate
  };
};

export { useDistinctAdditionalForms };
