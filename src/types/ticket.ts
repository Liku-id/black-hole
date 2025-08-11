export interface Ticket {
  id: string;
  ticket_type_id: string;
  transaction_id: string;
  ticket_id: string;
  ticket_name: string;
  visitor_name: string;
  ticket_status: string;
  issued_at: string;
  redeemed_at: string;
  checked_in_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface TicketsResponse {
  statusCode: number;
  message: string;
  body: {
    tickets: Ticket[];
    show: number;
    page: number;
    total: string;
    totalPage: number;
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
}
