import { apiUtils } from '@/utils/apiUtils';

export interface WithdrawalSummary {
  eventId: string;
  eventName: string;
  eventOrganizerId: string;
  withdrawalAmount: string;
  settlementAmount: string;
  availableAmount: string;
  totalAmount: string;
  pendingSettlementAmount: string;
  lastUpdated: string;
}

export interface WithdrawalSummariesResponse {
  statusCode: number;
  message: string;
  body: WithdrawalSummary[];
}

export interface WithdrawalSummaryResponse {
  statusCode: number;
  message: string;
  body: WithdrawalSummary;
}

export interface WithdrawalRequest {
  eventId: string;
  requestedAmount: string;
  bankId: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface FeeSnapshot {
  threshold: string;
  platformFee: number;
  feeAmount: number;
}

export interface WithdrawalResponse {
  statusCode: number;
  message: string;
  body: {
    id: string;
    withdrawalId: string;
    eventId: string;
    eventOrganizerId: string;
    createdBy: string;
    requestedAmount: string;
    totalFee: number;
    amountReceived: string;
    status: string;
    approvedBy: string;
    approvedAt: string;
    rejectedBy: string;
    rejectedAt: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    feeSnapshot: FeeSnapshot[];
    bankId: string;
    accountNumber: string;
    accountHolderName: string;
  };
}

class WithdrawalService {
  async getSummaries(): Promise<WithdrawalSummariesResponse> {
    return apiUtils.get<WithdrawalSummariesResponse>(
      '/api/withdrawal/summary',
      undefined,
      'Failed to fetch withdrawal summaries'
    );
  }

  async getSummaryByEventId(
    eventId: string
  ): Promise<WithdrawalSummaryResponse> {
    return apiUtils.get<WithdrawalSummaryResponse>(
      `/api/withdrawal/summary/${eventId}`,
      undefined,
      'Failed to fetch withdrawal summary'
    );
  }

  async createWithdrawal(data: WithdrawalRequest): Promise<WithdrawalResponse> {
    console.log(data);
    return apiUtils.post<WithdrawalResponse>(
      '/api/withdrawal',
      data,
      'Failed to create withdrawal request'
    );
  }
}

export const withdrawalService = new WithdrawalService();
