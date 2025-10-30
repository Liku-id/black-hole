import { TicketsFilters, TicketsResponse, TicketStatus } from '@/types/ticket';
import { apiUtils } from '@/utils/apiUtils';
import axios from 'axios';

// Additional Forms interfaces
export interface AdditionalForm {
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

export interface AdditionalFormsResponse {
  statusCode: number;
  message: string;
  additionalForms: AdditionalForm[];
}

export interface CreateAdditionalFormRequest {
  ticketTypeId: string;
  field: string;
  type: 'TEXT' | 'PARAGRAPH' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';
  options?: string[];
  isRequired: boolean;
  order: number;
}

export interface UpdateAdditionalFormRequest {
  ticketTypeId: string;
  field: string;
  type: 'TEXT' | 'PARAGRAPH' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';
  options?: string[];
  isRequired: boolean;
  order: number;
}

export interface CreateAdditionalFormResponse {
  statusCode: number;
  message: string;
  data: AdditionalForm;
}

export interface UpdateAdditionalFormResponse {
  statusCode: number;
  message: string;
  data: AdditionalForm;
}

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
    deleted_at: string | null;
    ticketStartDate: string;
    ticketEndDate: string;
    additional_forms: any[];
  };
}

interface RedeemTicketPayload {
  ticketStatus: TicketStatus;
}

interface RedeemTicketResponse {
  statusCode: number;
  message: string;
  body?: any;
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

  async createTicketType(
    ticketType: TicketTypePayload
  ): Promise<CreateTicketTypesResponse> {
    try {
      const response = await apiUtils.post<CreateTicketTypesResponse>(
        '/api/tickets/ticket-types/create',
        ticketType,
        'Failed to create ticket type'
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getTicketType(ticketTypeId: string): Promise<any> {
    try {
      const response = await apiUtils.get(`/api/tickets/ticket-types/${ticketTypeId}`);
      return response.body;
    } catch (error) {
      console.error('Error fetching ticket type:', error);
      throw error;
    }
  }

  async updateTicketType(
    id: string,
    ticketType: TicketTypePayload
  ): Promise<void> {
    try {
      await apiUtils.put<void>(
        `/api/tickets/ticket-types/${id}`,
        ticketType,
        'Failed to update ticket type'
      );
    } catch (error) {
      console.error('Error updating ticket type:', error);
      throw error;
    }
  }

  async deleteTicketType(id: string): Promise<void> {
    try {
      await apiUtils.delete<void>(
        `/api/tickets/ticket-types/${id}`,
        'Failed to delete ticket type'
      );
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      throw error;
    }
  }

  async redeemTicket(
    id: string,
    payload: RedeemTicketPayload
  ): Promise<RedeemTicketResponse> {
    try {
      const response = await apiUtils.put<RedeemTicketResponse>(
        `/api/tickets/${id}`,
        payload,
        'Failed to redeem ticket'
      );
      return response;
    } catch (error) {
      console.error('Error redeeming ticket:', error);
      throw error;
    }
  }

  async exportTickets(eventId: string, eventName?: string): Promise<void> {
    try {
      if (!eventId) {
        throw new Error('Event ID is required for ticket export');
      }

      const url = '/api/tickets-export';
      const params = { event_id: eventId };

      // Make request using axios with blob responseType
      const response = await axios({
        method: 'GET',
        url,
        params,
        responseType: 'blob',
        withCredentials: true,
        timeout: 30000
      });

      // Generate filename with new format: attendees_ticket_[event name]_[exported date DDMMYYYY & time HH:MM:SS].csv
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, ''); // DDMMYYYY format
      const timeStr = now.toLocaleTimeString('en-GB', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }).replace(/:/g, ''); // HHMMSS format
      
      const eventNameFormatted = eventName ? eventName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') : 'unknown_event';
      const filename = `attendees_ticket_${eventNameFormatted}_${dateStr}_${timeStr}.csv`;

      // Convert response to blob and download
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'text/csv'
      });

      // Download file
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw apiUtils.handleAxiosError(error, 'Failed to export tickets');
      }
      throw error;
    }
  }

  // Additional Forms methods
  async createAdditionalForm(data: CreateAdditionalFormRequest): Promise<CreateAdditionalFormResponse> {
    try {
      const response = await apiUtils.post(`/api/tickets/ticket-types/${data.ticketTypeId}/additional-forms`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating additional form:', error);
      throw error;
    }
  }

  async updateAdditionalForm(formId: string, data: UpdateAdditionalFormRequest): Promise<UpdateAdditionalFormResponse> {
    try {
      const response = await apiUtils.put(`/api/tickets/ticket-types/additional-forms/${formId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating additional form:', error);
      throw error;
    }
  }

  async deleteAdditionalForm(formId: string): Promise<void> {
    try {
      await apiUtils.delete(`/api/tickets/ticket-types/additional-forms/${formId}`);
    } catch (error) {
      console.error('Error deleting additional form:', error);
      throw error;
    }
  }
}

const ticketsService = new TicketsService();

export { ticketsService };
