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

export interface EventAsset {
  id: string;
  eventId: string;
  assetId: string;
  order: string;
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
  eventStatus:string;
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
  termAndConditions: string;
  websiteUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  ticketTypes: TicketType[];
  tickets: Ticket[];
  city: City;
  eventOrganizer: EventOrganizer;
  paymentMethods: PaymentMethod[];
  adminFee: number;
  tax: number;
  feeThresholds: FeeThreshold[];
  eventAssets: EventAsset[];
  is_requested: boolean;
  rejectedReason: string | null;
  rejectedFields: string[] | null;
  withdrawalFee: string;
}

export interface EventDetailResponse {
  statusCode: number;
  message: string;
  body: EventDetail;
}

export interface EventsResponse {
  message: string;
  body: {
    events: Event[];
    eventCountByStatus: EventCountByStatus;
    show: number;
    page: number;
    total: string;
    totalPage: number;
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
}

export interface CreateEventResponse {
  statusCode: number;
  message: string;
  body: Event;
}
