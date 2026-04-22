export interface OTSSummaryData {
  total_revenue: number;
  ticket_sold: number;
  total_transaction: number;
  total_visitors: number;
}

export interface OTSSummaryResponse {
  data: OTSSummaryData;
}

export interface OTSTransaction {
  id: string;
  name: string;
  ticket_category: string;
  ticket_type: string;
  ticket_amount: number;
  order_id: string;
  amount: number;
  payment_method: string;
  status_payment: string;
}

export interface OTSTransactionsResponse {
  data: OTSTransaction[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}
