import { useState } from 'react';
import { authService } from '@/services';

interface UpdateEventOrganizerGeneralData {
  name: string;
  description: string;
  social_media_url: string;
  address: string;
  asset_id: string;
  organizer_type?: string;
}

interface UseUpdateEventOrganizerGeneralReturn {
  updateOrganizer: (eoId: string, data: UpdateEventOrganizerGeneralData) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useUpdateEventOrganizerGeneral = (): UseUpdateEventOrganizerGeneralReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrganizer = async (eoId: string, data: UpdateEventOrganizerGeneralData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.updateEventOrganizerGeneral(eoId, data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update organizer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateOrganizer,
    loading,
    error
  };
};
