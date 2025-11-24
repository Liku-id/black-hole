import { useState } from 'react';
import { partnersService, UpdatePartnerRequest } from '@/services/partners';
import { useToast } from '@/contexts/ToastContext';

interface UseUpdatePartnerReturn {
  updatePartner: (id: string, data: UpdatePartnerRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useUpdatePartner = (): UseUpdatePartnerReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const updatePartner = async (id: string, data: UpdatePartnerRequest) => {
    setLoading(true);
    setError(null);
    try {
      await partnersService.updatePartner(id, data);
      showSuccess('Partner updated successfully');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update partner';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updatePartner,
    loading,
    error
  };
};

