import { TicketsFilters, TicketsResponse } from '@/types/ticket';
import { apiUtils } from '@/utils/apiUtils';

interface TicketTypePayload {
  name: string;
  quantity: number;
  description: string;
  price: number;
  eventId: string;
  maxOrderQuantity: number;
  colorHex: string;
  salesStartDate: string;
  salesEndDate: string;
  isPublic: boolean;
  ticketStartDate: string;
  ticketEndDate: string;
}

interface CreateTicketTypesResponse {
  statusCode: number;
  message: string;
  body: {
    ticketTypes: Array<{
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
      purchased_amount: number;
      created_at: string;
      updated_at: string;
      deleted_at: string;
      ticketStartDate: string;
      ticketEndDate: string;
    }>;
  };
}

class TicketsService {
  async getTickets(filters: TicketsFilters): Promise<TicketsResponse> {
    try {
      const params: Record<string, any> = {};

      // Required parameters
      params.eventId = filters.eventId;

      // Optional parameters
      if (filters.page !== undefined) params.page = filters.page.toString();
      if (filters.show !== undefined) params.show = filters.show.toString();
      if (filters.search) params.search = filters.search;

      return await apiUtils.get<TicketsResponse>(
        '/api/tickets',
        params,
        'Failed to fetch tickets'
      );
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async createTicketTypes(
    ticketTypes: TicketTypePayload[]
  ): Promise<CreateTicketTypesResponse> {
    try {
      console.log(
        '🔍 TicketsService - Payload:',
        JSON.stringify(ticketTypes, null, 2)
      );
      const response = await apiUtils.post<CreateTicketTypesResponse>(
        '/api/tickets/ticket-types/create',
        ticketTypes,
        'Failed to create ticket types'
      );
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

const ticketsService = new TicketsService();

export { ticketsService };
