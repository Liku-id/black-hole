import { useState, useEffect } from 'react';

import { ticketsService, AdditionalForm } from '@/services/tickets';

export const useAdditionalFormsByTicketType = (ticketTypeId: string | null) => {
  const [additionalForms, setAdditionalForms] = useState<AdditionalForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdditionalForms = async () => {
      if (!ticketTypeId) {
        setAdditionalForms([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await ticketsService.getAdditionalFormsByTicketType(ticketTypeId);
        setAdditionalForms(response.additionalForms || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch additional forms');
        setAdditionalForms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalForms();
  }, [ticketTypeId]);

  return {
    additionalForms,
    loading,
    error
  };
};
