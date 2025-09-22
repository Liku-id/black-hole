import { useState } from 'react';
import { authService } from '@/services';

interface UpdateEventOrganizerLegalData {
  npwp_photo_id: string;
  npwp_number: string;
  npwp_address: string;
  full_name: string;
  ktp_photo_id?: string;
  ktp_number?: string;
  ktp_address?: string;
  pic_name?: string;
  pic_title?: string;
}

interface UseUpdateEventOrganizerLegalReturn {
  updateLegal: (eoId: string, data: UpdateEventOrganizerLegalData) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export const useUpdateEventOrganizerLegal = (): UseUpdateEventOrganizerLegalReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLegal = async (eoId: string, data: UpdateEventOrganizerLegalData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.updateEventOrganizerLegal(eoId, data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update legal information';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateLegal,
    loading,
    error
  };
};
