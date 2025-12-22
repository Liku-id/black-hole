export type TicketStatus = 'pending' | 'issued' | 'cancelled' | 'redeemed';

export interface AttendeeAdditionalData {
  id: string;
  ticket_id: string;
  additional_form_id: string;
  value: string[];
  field: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  ticket_type_id: string;
  transaction_id: string;
  ticket_id: string;
  ticket_name: string;
  visitor_name: string;
  ticket_status: TicketStatus;
  issued_at: string;
  redeemed_at?: string;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  email?: string;
  phone_number?: string;
  payment_method_name?: string;
  transaction_number?: string;
  attendee_data?: AttendeeAdditionalData[];
}

export interface TicketsResponse {
  statusCode: number;
  message: string;
  body: {
    data: Ticket[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface TicketsErrorResponse {
  code: number;
  message: string;
  details: Array<{
    '@type': string;
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
  }>;
}

export interface TicketsFilters {
  eventId: string;
  page?: number;
  show?: number;
  search?: string;
  ticketTypeIds?: string;
  ticketStatus?: TicketStatus;
}
