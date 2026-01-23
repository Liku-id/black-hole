export interface City {
  id: string;
  name: string;
}

export interface Bank {
  id: string;
  name: string;
  channelCode: string;
  channelType: string;
  minAmount: number;
  maxAmount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  logo: string;
  bankId: string;
  requestType: string;
  paymentCode: string;
  channelProperties: Record<string, any>;
  rules: string[];
  bank: Bank | null;
}

export interface TicketType {
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
  status?: string;
  rejected_fields?: string[];
  rejected_reason?: string;
  additional_forms?: Array<{
    id: string;
    field: string;
    type: string;
    isRequired: boolean;
    order: number;
    deletedAt?: string;
    answer?: string;
  }>;
}

export interface Asset {
  id: string;
  type: string;
  url: string;
  bucket: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventAssetChangeItem {
  id: string;
  eventAssetChangeId: string;
  assetId: string;
  order: number;
  eventAssetId: string;
  asset: Asset;
  status?: string;
  rejectedReason?: string;
  rejectedFields?: string[];
}

export interface EventAssetChange {
  id: string;
  eventId: string;
  status: string;
  rejectedFields: string[];
  rejectedReason: string;
  items: EventAssetChangeItem[];
}

export interface EventAsset {
  id: string;
  eventId: string;
  assetId: string;
  order: string;
  status?: string;
  asset: Asset;
}

export interface EventCountByStatus {
  approved: number;
  done: number;
  draft: number;
  onGoing: number;
  onReview: number;
  rejected: number;
}

export interface Event {
  id: string;
  name: string;
  eventStatus: string;
  eventType: string;
  eventOrganizerId: string;
  eventOrganizerName: string;
  description: string;
  address: string;
  mapLocationUrl: string;
  metaUrl: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  city: City;
  paymentMethods: PaymentMethod[];
  lowestPriceTicketType: TicketType;
  eventAssets: EventAsset[];
  eventCountByStatus: EventCountByStatus;
  soldTickets: string;
  totalRevenue: string;
  eventUpdateRequestStatus: string;
}

export interface GroupTicket {
  id: string;
  ticket_type_id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  bundle_quantity: number;
  max_order_quantity: number;
  sales_start_date: string;
  sales_end_date: string;
  status: string;
  rejected_reason: string;
  created_at: string;
  updated_at: string;
  ticket_type: TicketType;
  purchased_amount: number;
}

// Event Detail specific interfaces
export interface EventOrganizer {
  id: string;
  bank_information_id: string;
  name: string;
  email: string;
  phone_number: string;
  asset_id: string;
  description: string;
  social_media_url: string;
  address: string;
  pic_title: string;
  ktp_photo_id: string;
  npwp_photo_id: string;
  user_id: string;
  nik: string;
  npwp: string;
  xenplatform_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  bank_information: {
    id: string;
    bankId: string;
    accountNumber: string;
    accountHolderName: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    bank: Bank;
  } | null;
  event_organizer_pic: {
    id: string;
    name: string;
    email: string;
    password: string;
  } | null;
  asset: Asset | null;
  ktpPhoto: Asset | null;
  npwpPhoto: Asset | null;
}

export interface Ticket {
  // Add ticket interface if needed
}

export interface FeeThreshold {
  threshold: string;
  platformFee: string;
}

export interface EventUpdateRequest {
  id: string;
  eventId: string;
  status: string;
  eventDetailStatus?: string;
  rejectedReason?: string;
  rejectedFields?: string[];
  updatedFields?: string[];
  createdAt: string;
  updatedAt: string;
  name: string;
  eventType: string;
  description: string;
  address: string;
  mapLocationUrl: string;
  termAndConditions: string;
  websiteUrl: string;
  adminFee: number;
  tax: number;
  startDate: string;
  endDate: string;
  cityId: string;
  eventOrganizerId: string;
  paymentMethodIds: string[];
  login_required?: boolean;
}

export interface EventDetail {
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
  eventDetailStatus?: string;
  termAndConditions: string;
  websiteUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  ticketTypes: TicketType[];
  group_tickets: GroupTicket[];
  tickets: Ticket[];
  city: City;
  eventOrganizer: EventOrganizer;
  paymentMethods: PaymentMethod[];
  adminFee: number;
  tax: number;
  feeThresholds: FeeThreshold[];
  eventAssets: EventAsset[];
  eventAssetChanges?: EventAssetChange[];
  is_requested: boolean;
  eventUpdateRequestStatus?: string;
  rejectedReason: string | null;
  rejectedFields: string[] | null;
  withdrawalFee: string;
  login_required: boolean;
  eventUpdateRequest?: EventUpdateRequest | null;
}

export interface EventDetailResponse {
  statusCode: number;
  message: string;
  body: EventDetail;
}

export interface Pagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EventsResponse {
  message: string;
  body: {
    data: Event[];
    eventCountByStatus: EventCountByStatus;
    pagination: Pagination;
  };
}

export interface EventsFilters {
  show?: number;
  page?: number;
  cityId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: string | string[];
  event_organizer_id?: string;
}

export interface EventTypesResponse {
  eventTypes: string[];
}

export interface CreateEventRequest {
  cityId: string;
  eventOrganizerId: string;
  paymentMethodIds: string[];
  name: string;
  eventType: string;
  description: string;
  address: string;
  mapLocationUrl: string;
  startDate: string;
  endDate: string;
  termAndConditions: string;
  websiteUrl: string;
  metaUrl: string;
  adminFee: number;
  tax: number;
  login_required?: boolean;
}

export interface CreateEventResponse {
  statusCode: number;
  message: string;
  body: Event;
}
