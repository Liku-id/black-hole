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

export interface City {
  id: string;
  name: string;
}

export interface FeeThreshold {
  threshold: string;
  platformFee: number;
}

export interface Event {
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
  feeThresholds: FeeThreshold[];
  eventAssets: EventAsset[];
}

export interface VirtualAccount {
  id: string;
  externalId: string;
  ownerId: string;
  bankCode: string;
  merchantCode: string;
  accountNumber: string;
  name: string;
  currency: string;
  isSingleUse: boolean;
  isClosed: boolean;
  expectedAmount: number;
  suggestedAmount: number;
  expirationDate: string;
  description: string;
  status: string;
  alternativeDisplays: Array<{
    type: string;
    data: string;
  }>;
}

export interface QrisPayment {
  id: string;
  referenceId: string;
  businessId: string;
  type: string;
  currency: string;
  amount: number;
  channelCode: string;
  status: string;
  qrString: string;
  expiresAt: string;
  created: string;
  updated: string;
  metadata: Record<string, any>;
}

export interface PaymentDetails {
  va?: VirtualAccount;
  qris?: QrisPayment;
}

export interface PaymentBreakdown {
  basedPrice: number;
  fee: number;
  tax: number;
  totalPrice: number;
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

export interface Transaction {
  id: string;
  transactionNumber: string;
  name: string;
  expiresAt: string;
  createdAt: string;
  status: string;
  paymentMethod: PaymentMethod;
  ticketType?: TicketType;  // Optional for single tickets
  group_ticket?: GroupTicket;  // Optional for group tickets
  event: Event;
  paymentDetails: PaymentDetails;
  orderQuantity: number;
  paymentBreakdown: PaymentBreakdown;
}

export interface TransactionsResponse {
  statusCode: number;
  message: string;
  transactions: Transaction[];
  pagination: {
    page: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TransactionsFilters {
  page?: number;
  show?: number;
  eventId?: string;
  partnerId?: string;
  search?: string;
  status?: string;
}

export interface TransactionError {
  code: number;
  message: string;
  details: Array<{
    '@type': string;
    [key: string]: any;
  }>;
}

export interface ExportTransactionData {
  full_name: string;
  event_name: string;
  ticket_type_name: string;
  quantity: number;
  order_id: string;
  amount: number;
  payment_method_name: string;
  payment_status: string;
  fee: number;
  tax: number;
  date: string; // Format: YYYY-MM-DD HH:MM:SS
}

export interface ExportTransactionsResponseBody {
  transactions: ExportTransactionData[];
  csv_content: string; // CSV file content as string
  csv_filename: string; // Suggested filename for download
}

export interface ExportTransactionsResponse {
  status_code: number;
  message: string;
  body: ExportTransactionsResponseBody;
}

export interface ExportTransactionsRequest {
  from_date?: string; // Format: YYYY-MM-DD (optional)
  to_date?: string; // Format: YYYY-MM-DD (optional)
  payment_status?: string; // Filter by payment status (optional)
  event_id?: string; // Filter by event_id (optional)
}

export interface TransactionSummary {
  ticketSales: {
    total: number;
    amount: number;
  };
  payment: number;
  withdrawal: number;
  balance: number;
}
