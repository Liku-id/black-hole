import { ticketsService } from '@/services/tickets';

import { useApi } from '../../useApi';

interface TicketType {
  id: string;
  name: string;
  quantity: number;
  description: string;
  price: number;
  event_id: string;
  max_order_quantity: number;
  color_hex: string;
  sales_start_date: string;
  sales_end_date: string;
  is_public: boolean;
  is_logged_in: boolean;
  purchased_amount: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  ticketStartDate: string;
  ticketEndDate: string;
  additional_forms: AdditionalForm[];
}

interface AdditionalForm {
  id: string;
  ticketTypeId: string;
  field: string;
  type: 'TEXT' | 'PARAGRAPH' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';
  options: string[];
  isRequired: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface UseTicketTypeReturn {
  ticketType: TicketType | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
  additionalForms: AdditionalForm[];
}

const useTicketType = (ticketTypeId: string | null): UseTicketTypeReturn => {
  const { data, loading, error, mutate } = useApi(
    ticketTypeId ? [`/api/tickets/ticket-types/${ticketTypeId}`] : null,
    () => (ticketTypeId ? ticketsService.getTicketType(ticketTypeId) : Promise.resolve(null))
  );

  return {
    ticketType: data || null,
    loading,
    error,
    mutate,
    additionalForms: data?.additional_forms || []
  };
};

export { useTicketType };
