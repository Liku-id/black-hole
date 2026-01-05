import { useState } from 'react';

import { useToast } from '@/contexts/ToastContext';
import { partnersService, CreatePartnerRequest } from '@/services/partners';

interface UseCreatePartnerReturn {
  createPartner: (data: CreatePartnerRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useCreatePartner = (): UseCreatePartnerReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const createPartner = async (data: CreatePartnerRequest) => {
    setLoading(true);
    setError(null);
    try {
      await partnersService.createPartner(data);
      showSuccess('Partner created successfully');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create partner';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPartner,
    loading,
    error
  };
};
