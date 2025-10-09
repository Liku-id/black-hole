export interface BankInfo {
  id: string;
  name: string;
  logo?: string;
  channelCode: string;
  channelType: string;
  minAmount: number;
  maxAmount: number;
}

export interface BankInformation {
  id: string;
  bankId: string;
  accountNumber: string;
  accountHolderName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  bank: BankInfo;
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

export interface EventOrganizerPic {
  id: string;
  name: string;
  email: string;
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
  deleted_at: string | null;
  bank_information: BankInformation | null;
  event_organizer_pic: EventOrganizerPic | null;
  asset: Asset | null;
  ktpPhoto: Asset | null;
  npwpPhoto: Asset | null;
}

export interface EventOrganizerMeResponse {
  statusCode: number;
  message: string;
  body: EventOrganizer;
}

export interface EventOrganizersResponse {
  message: string;
  body: {
    eventOrganizers: EventOrganizer[];
  };
}

export interface EventOrganizerStatistics {
  event_organizer_name: string;
  total_tickets_sold: number;
  total_revenue: number;
  total_successful_transactions: number;
  average_tickets_per_transaction: number;
}

export interface EventOrganizerStatisticsResponse {
  status_code: number;
  message: string;
  body: EventOrganizerStatistics;
}

export interface ListEventOrganizersRequest {
  name?: string;
  page?: number;
  show?: number;
}

export interface ListEventOrganizersResponseBody {
  eventOrganizers: EventOrganizer[];
  show: number;
  page: number;
  total: number;
  totalPage: number;
}

export interface ListEventOrganizersResponse {
  statusCode: number;
  message: string;
  body: ListEventOrganizersResponseBody;
}
