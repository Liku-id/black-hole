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
  name?: string;
  email?: string;
  phone_number?: string;
  payment_method_name?: string;
  transaction_number?: string;
  attendee_data?: AttendeeAdditionalData[];
  booking_type?: string;
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

export interface TicketInvitation {
  id: string;
  ticketType: {
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
    status: string;
    rejected_fields: string[];
    rejected_reason: string;
    additional_forms: any[];
    partnership_info: any | null;
  };
  event: {
    id: string;
    name: string;
    eventType: string;
    description: string;
    address: string;
    mapLocationUrl: string;
    metaUrl: string;
    startDate: string;
    endDate: string;
    eventStatus: string;
    eventDetailStatus: string;
    termAndConditions: string;
    websiteUrl: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    ticketTypes: any[];
    city: any | null;
    eventOrganizer: {
      id: string;
      name: string;
      email: string;
      phone_number: string;
      description: string;
      address: string;
      [key: string]: any;
    };
    paymentMethods: any[];
    adminFee: number;
    tax: number;
    feeThresholds: any[];
    eventAssets: any[];
    is_requested: boolean;
    login_required: boolean;
    eventUpdateRequestStatus: string;
    eventUpdateRequest: any | null;
    eventAssetChanges: any[];
    rejectedFields: string[];
    rejectedReason: string;
    updatedFields: string[];
    group_tickets: any[];
  };
  tickets: Ticket[];
  name: string;
  email: string;
  phone_number: string;
  ticket_qty: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TicketInvitationResponse {
  status_code: number;
  message: string;
  body: TicketInvitation;
}
