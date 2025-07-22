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
