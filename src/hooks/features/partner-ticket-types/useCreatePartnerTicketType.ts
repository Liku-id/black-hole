import { useState } from 'react';
import {
  partnerTicketTypesService,
  CreatePartnerTicketTypeRequest
} from '@/services/partner-ticket-types';
import { useToast } from '@/contexts/ToastContext';

interface UseCreatePartnerTicketTypeReturn {
  createPartnerTicketType: (
    data: CreatePartnerTicketTypeRequest
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useCreatePartnerTicketType =
  (): UseCreatePartnerTicketTypeReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showSuccess, showError } = useToast();

    const createPartnerTicketType = async (
      data: CreatePartnerTicketTypeRequest
    ) => {
      setLoading(true);
      setError(null);
      try {
        await partnerTicketTypesService.createPartnerTicketType(data);
        showSuccess('Private link created successfully');
      } catch (err: any) {
        const errorMessage =
          err?.message || 'Failed to create partner ticket type';
        setError(errorMessage);
        showError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    return {
      createPartnerTicketType,
      loading,
      error
    };
  };

