export interface EventSubmission {
  id: string;
  type: string;
  event: EventSubmissionEvent;
  eventUpdateRequest?: EventUpdateRequest;
  createdAt: string;
  updatedAt: string;
}

export interface EventSubmissionEvent {
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
  deletedAt: string;
  ticketTypes: TicketType[];
  city: City;
  eventOrganizer: EventOrganizer;
  paymentMethods: PaymentMethod[];
  adminFee: number;
  tax: number;
  feeThresholds: FeeThreshold[];
  eventAssets: EventAsset[];
  is_requested: boolean;
}

export interface EventUpdateRequest {
  id: string;
  eventId: string;
  updatedFields: string[];
  rejectedFields: string[];
  rejectedReason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  eventType: string;
  description: string;
  address: string;
  mapLocationUrl: string;
  cityId: string;
  eventOrganizerId: string;
  paymentMethodIds: string[];
  startDate: string;
  endDate: string;
  termAndConditions: string;
  websiteUrl: string;
  metaUrl: string;
  adminFee: number;
  tax: number;
  feeThresholds: FeeThreshold[];
}

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
  paymentMethodFee: number;
  settlement: number;
  channelProperties: Record<string, any>;
  rules: string[];
  bank: Bank;
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
}

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
  organizer_type: string;
  npwp_address: string;
  ktp_address: string;
  full_name: string;
  pic_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  bank_information: BankInformation;
  event_organizer_pic: EventOrganizerPic;
  asset: Asset;
  ktpPhoto: Asset;
  npwpPhoto: Asset;
}

export interface BankInformation {
  id: string;
  bankId: string;
  accountNumber: string;
  accountHolderName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  bank: Bank;
}

export interface EventOrganizerPic {
  id: string;
  name: string;
  email: string;
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

export interface FeeThreshold {
  threshold: string;
  platformFee: number;
}

export interface EventAsset {
  id: string;
  eventId: string;
  assetId: string;
  order: string;
  asset: Asset;
}

export interface EventSubmissionsFilters {
  show?: number;
  page?: number;
  search?: string;
  type?: 'new' | 'update';
}

export interface EventSubmissionsResponse {
  statusCode: number;
  message: string;
  body: {
    data: EventSubmission[];
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
