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
  quantity: string;
  description: string;
  price: string;
  event_id: string;
  max_order_quantity: number;
  color_hex: string;
  sales_start_date: string;
  sales_end_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
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

export interface Event {
  id: string;
  name: string;
  eventType: string;
  eventOrganizerName: string;
  description: string;
  address: string;
  mapLocationUrl: string;
  metaUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  city: City;
  paymentMethods: PaymentMethod[];
  lowestPriceTicketType: TicketType;
  eventAssets: EventAsset[];
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
  bank_information: any;
  event_organizer_pic: any;
  asset: any;
  ktpPhoto: any;
  npwpPhoto: any;
}

export interface Ticket {
  // Add ticket interface if needed
}

export interface FeeThreshold {
  // Add fee threshold interface if needed
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
  feeThresholds: FeeThreshold[];
  eventAssets: EventAsset[];
}

export interface EventDetailResponse {
  message: string;
  body: EventDetail;
}

export interface EventsResponse {
  message: string;
  body: {
    events: Event[];
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
}
