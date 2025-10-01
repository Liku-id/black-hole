import { apiUtils } from '@/utils/apiUtils';

export interface WithdrawalSummary {
  eventId: string;
  eventName: string;
  eventOrganizerId: string;
  eventStatus: string;
  withdrawalAmount: string;
  settlementAmount: string;
  availableAmount: string;
  totalAmount: string;
  pendingSettlementAmount: string;
  lastUpdated: string;
  platformFee: string;
  withdrawalFee: string;
  bankName: string;
  bankId: string;
  accountNumber: string;
  accountHolderName: string;
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

export interface EventOrganizerSummaryResponse {
  statusCode: number;
  message: string;
  body: {
    eventOrganizerId: string;
    eventOrganizerName: string;
    email: string;
    createdAt: string;
    totalEarnings: string;
    totalWithdrawn: string;
    totalAvailable: string;
    totalPlatformFees: string;
    pendingSettlementAmount: string;
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    pendingEvents: number;
    pendingWithdrawals: string;
    approvedWithdrawals: string;
    rejectedWithdrawals: string;
    lastUpdated: string;
  };
}

export interface WithdrawalRequest {
  eventId: string;
  requestedAmount: string;
  bankId: string;
  accountNumber: string;
  accountHolderName: string;
  withdrawalName: string;
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

export interface WithdrawalListItem {
  id: string;
  withdrawalId: string;
  withdrawalName: string;
  eventId: string;
  eventName: string;
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
  bankName: string;
}

export interface WithdrawalListResponse {
  statusCode: number;
  message: string;
  body: WithdrawalListItem[];
}

export interface WithdrawalActionRequest {
  id: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface WithdrawalActionResponse {
  statusCode: number;
  message: string;
  body: WithdrawalListItem;
}

export interface WithdrawalHistoryItem {
  id: string;
  withdrawalId: string;
  eventId: string;
  eventName: string;
  eventOrganizerId: string;
  createdBy: string;
  requestedAmount: string;
  totalFee: number;
  withdrawalFee: string;
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
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface WithdrawalHistoryResponse {
  statusCode: number;
  message: string;
  body: WithdrawalHistoryItem[];
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

  async getEventOrganizerSummary(
    eventOrganizerId?: string
  ): Promise<EventOrganizerSummaryResponse> {
    const params = eventOrganizerId ? { eventOrganizerId } : undefined;

    return apiUtils.get<EventOrganizerSummaryResponse>(
      '/api/withdrawal/event-organizer/summary',
      params,
      'Failed to fetch event organizer summary'
    );
  }

  async getWithdrawals(status?: string): Promise<WithdrawalListResponse> {
    return apiUtils.get<WithdrawalListResponse>(
      '/api/withdrawal/list',
      status ? { status } : undefined,
      'Failed to fetch withdrawals'
    );
  }

  async createWithdrawal(data: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      // Validate required fields
      if (!data.eventId) {
        throw new Error('Event ID is required');
      }
      if (!data.requestedAmount || parseFloat(data.requestedAmount) <= 0) {
        throw new Error('Valid withdrawal amount is required');
      }
      if (!data.bankId) {
        throw new Error('Bank ID is required');
      }
      if (!data.accountNumber) {
        throw new Error('Account number is required');
      }
      if (!data.accountHolderName) {
        throw new Error('Account holder name is required');
      }
      if (!data.withdrawalName) {
        throw new Error('Withdrawal name is required');
      }

      return await apiUtils.post<WithdrawalResponse>(
        '/api/withdrawal',
        data,
        'Failed to create withdrawal request'
      );
    } catch (error) {
      console.error('Withdrawal creation error:', error);
      throw error;
    }
  }

  async actionWithdrawal(
    withdrawalId: string,
    data: WithdrawalActionRequest
  ): Promise<WithdrawalActionResponse> {
    return apiUtils.put<WithdrawalActionResponse>(
      `/api/withdrawal/${withdrawalId}/action`,
      data,
      'Failed to process withdrawal action'
    );
  }

  async getWithdrawalHistory(
    eventId: string | undefined,
    eventOrganizerId: string | undefined
  ): Promise<WithdrawalHistoryResponse> {
    const params: any = {};

    if (eventId) {
      params.eventId = eventId;
    }

    if (eventOrganizerId) {
      params.eventOrganizerId = eventOrganizerId;
    }

    console.log(
      'WithdrawalService.getWithdrawalHistory called with params:',
      params
    );
    console.log('API endpoint: /api/withdrawal/history');

    return apiUtils.get<WithdrawalHistoryResponse>(
      '/api/withdrawal/history',
      params,
      'Failed to fetch withdrawal history'
    );
  }
}

export const withdrawalService = new WithdrawalService();
