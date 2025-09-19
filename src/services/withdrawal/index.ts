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
}

export const withdrawalService = new WithdrawalService();
