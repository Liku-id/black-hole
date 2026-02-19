import { apiUtils } from '@/utils/apiUtils';

import type {
  WithdrawalSummariesResponse,
  WithdrawalSummaryResponse,
  EventOrganizerSummaryResponse,
  WithdrawalListResponse,
  WithdrawalResponse,
  WithdrawalActionResponse,
  WithdrawalHistoryResponse,
  PaginationFilters,
  WithdrawalRequest,
  WithdrawalActionRequest
} from './index';
import { withdrawalService } from './index';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('WithdrawalService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<
    typeof apiUtils.get
  >;
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<
    typeof apiUtils.post
  >;
  const mockApiUtilsPut = apiUtils.put as jest.MockedFunction<
    typeof apiUtils.put
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummaries', () => {
    it('should successfully fetch withdrawal summaries', async () => {
      const filters: PaginationFilters = {
        page: 1,
        show: 10,
      };

      const mockResponse: WithdrawalSummariesResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await withdrawalService.getSummaries(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/summary',
        {
          show: '10',
          page: '1'
        },
        'Failed to fetch withdrawal summaries'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle filters with status', async () => {
      const filters: PaginationFilters = {
        page: 2,
        show: 20,
        status: 'pending'
      };

      const mockResponse: WithdrawalSummariesResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 2,
            hasNext: false,
            hasPrev: false,
            limit: 20,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await withdrawalService.getSummaries(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/summary',
        {
          show: '20',
          page: '2'
        },
        'Failed to fetch withdrawal summaries'
      );
    });
  });

  describe('getSummaryByEventId', () => {
    it('should successfully fetch withdrawal summary by event ID', async () => {
      const mockResponse: WithdrawalSummaryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          eventId: 'event-1',
          eventName: 'Test Event',
          withdrawalAmount: '1000000',
          availableAmount: '500000'
        } as any
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await withdrawalService.getSummaryByEventId('event-1');

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/summary/event-1',
        undefined,
        'Failed to fetch withdrawal summary'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEventOrganizerSummary', () => {
    it('should fetch event organizer summary with ID', async () => {
      const mockResponse: EventOrganizerSummaryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          eventOrganizerId: 'org-1',
          eventOrganizerName: 'Test Organizer',
          email: 'test@example.com',
          totalEarnings: '5000000',
          totalWithdrawn: '3000000',
          totalAvailable: '2000000',
          totalPlatformFees: '500000',
          pendingSettlementAmount: '100000',
          totalEvents: 10,
          activeEvents: 3,
          completedEvents: 5,
          pendingEvents: 2,
          pendingWithdrawals: '200000',
          approvedWithdrawals: '2800000',
          rejectedWithdrawals: '0',
          createdAt: '2024-01-01',
          lastUpdated: '2024-12-01'
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await withdrawalService.getEventOrganizerSummary('org-1');

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/event-organizer/summary',
        { eventOrganizerId: 'org-1' },
        'Failed to fetch event organizer summary'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch event organizer summary without ID', async () => {
      const mockResponse: EventOrganizerSummaryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {} as any
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await withdrawalService.getEventOrganizerSummary();

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/event-organizer/summary',
        undefined,
        'Failed to fetch event organizer summary'
      );
    });
  });

  describe('getWithdrawals', () => {
    it('should successfully fetch withdrawals with minimal filters', async () => {
      const filters = {
        page: 1,
        show: 10,
      };

      const mockResponse: WithdrawalListResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await withdrawalService.getWithdrawals(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/list',
        {
          show: '10',
          page: '1'
        },
        'Failed to fetch withdrawals'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch withdrawals with status filter', async () => {
      const filters = {
        page: 1,
        show: 10,
        status: 'approved'
      };

      const mockResponse: WithdrawalListResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await withdrawalService.getWithdrawals(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/list',
        {
          show: '10',
          page: '1',
          status: 'approved'
        },
        'Failed to fetch withdrawals'
      );
    });

    it('should handle error when fetching withdrawals', async () => {
      const mockError = new Error('Network error');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(
        withdrawalService.getWithdrawals({ page: 1, show: 10 })
      ).rejects.toThrow('Network error');
    });
  });

  describe('createWithdrawal', () => {
    const validWithdrawal: WithdrawalRequest = {
      eventId: 'event-1',
      requestedAmount: '1000000',
      bankId: 'bank-1',
      accountNumber: '1234567890',
      accountHolderName: 'John Doe',
      withdrawalName: 'Event Withdrawal'
    };

    it('should successfully create withdrawal', async () => {
      const mockResponse: WithdrawalResponse = {
        statusCode: 201,
        message: 'Withdrawal created',
        body: {
          id: 'withdrawal-1',
          withdrawalId: 'WD-001',
          eventId: validWithdrawal.eventId,
          requestedAmount: validWithdrawal.requestedAmount,
          status: 'pending'
        } as any
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await withdrawalService.createWithdrawal(validWithdrawal);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/withdrawal',
        validWithdrawal,
        'Failed to create withdrawal request'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when event ID is missing', async () => {
      const invalidWithdrawal = {
        ...validWithdrawal,
        eventId: ''
      };

      await expect(
        withdrawalService.createWithdrawal(invalidWithdrawal)
      ).rejects.toThrow('Event ID is required');

      expect(mockApiUtilsPost).not.toHaveBeenCalled();
    });

    it('should throw error when requested amount is missing', async () => {
      const invalidWithdrawal = {
        ...validWithdrawal,
        requestedAmount: ''
      };

      await expect(
        withdrawalService.createWithdrawal(invalidWithdrawal)
      ).rejects.toThrow('Valid withdrawal amount is required');
    });

    it('should throw error when requested amount is zero or negative', async () => {
      const invalidWithdrawal = {
        ...validWithdrawal,
        requestedAmount: '0'
      };

      await expect(
        withdrawalService.createWithdrawal(invalidWithdrawal)
      ).rejects.toThrow('Valid withdrawal amount is required');
    });

    it('should throw error when bank ID is missing', async () => {
      const invalidWithdrawal = {
        ...validWithdrawal,
        bankId: ''
      };

      await expect(
        withdrawalService.createWithdrawal(invalidWithdrawal)
      ).rejects.toThrow('Bank ID is required');
    });

    it('should throw error when account number is missing', async () => {
      const invalidWithdrawal = {
        ...validWithdrawal,
        accountNumber: ''
      };

      await expect(
        withdrawalService.createWithdrawal(invalidWithdrawal)
      ).rejects.toThrow('Account number is required');
    });

    it('should throw error when account holder name is missing', async () => {
      const invalidWithdrawal = {
        ...validWithdrawal,
        accountHolderName: ''
      };

      await expect(
        withdrawalService.createWithdrawal(invalidWithdrawal)
      ).rejects.toThrow('Account holder name is required');
    });

    it('should throw error when withdrawal name is missing', async () => {
      const invalidWithdrawal = {
        ...validWithdrawal,
        withdrawalName: ''
      };

      await expect(
        withdrawalService.createWithdrawal(invalidWithdrawal)
      ).rejects.toThrow('Withdrawal name is required');
    });

    it('should handle error during creation', async () => {
      const mockError = new Error('Creation failed');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(
        withdrawalService.createWithdrawal(validWithdrawal)
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('actionWithdrawal', () => {
    it('should successfully approve withdrawal', async () => {
      const actionData: WithdrawalActionRequest = {
        id: 'withdrawal-1',
        action: 'approve'
      };

      const mockResponse: WithdrawalActionResponse = {
        statusCode: 200,
        message: 'Withdrawal approved',
        body: {
          id: 'withdrawal-1',
          status: 'approved'
        } as any
      };

      mockApiUtilsPut.mockResolvedValue(mockResponse);

      const result = await withdrawalService.actionWithdrawal(
        'withdrawal-1',
        actionData
      );

      expect(mockApiUtilsPut).toHaveBeenCalledWith(
        '/api/withdrawal/withdrawal-1/action',
        actionData,
        'Failed to process withdrawal action'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should successfully reject withdrawal with reason', async () => {
      const actionData: WithdrawalActionRequest = {
        id: 'withdrawal-1',
        action: 'reject',
        rejectionReason: 'Insufficient balance'
      };

      const mockResponse: WithdrawalActionResponse = {
        statusCode: 200,
        message: 'Withdrawal rejected',
        body: {
          id: 'withdrawal-1',
          status: 'rejected'
        } as any
      };

      mockApiUtilsPut.mockResolvedValue(mockResponse);

      await withdrawalService.actionWithdrawal('withdrawal-1', actionData);

      expect(mockApiUtilsPut).toHaveBeenCalledWith(
        '/api/withdrawal/withdrawal-1/action',
        actionData,
        'Failed to process withdrawal action'
      );
    });
  });

  describe('getWithdrawalHistory', () => {
    it('should fetch history with event ID', async () => {
      const mockResponse: WithdrawalHistoryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await withdrawalService.getWithdrawalHistory(
        'event-1',
        undefined,
        { page: 1, show: 10 }
      );

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/history',
        {
          eventId: 'event-1',
          limit: '10',
          page: '1'
        },
        'Failed to fetch withdrawal history'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch history with event organizer ID', async () => {
      const mockResponse: WithdrawalHistoryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await withdrawalService.getWithdrawalHistory(
        undefined,
        'org-1',
        { page: 1, show: 10 }
      );

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/history',
        {
          eventOrganizerId: 'org-1',
          limit: '10',
          page: '1'
        },
        'Failed to fetch withdrawal history'
      );
    });

    it('should fetch history with both event ID and organizer ID', async () => {
      const mockResponse: WithdrawalHistoryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await withdrawalService.getWithdrawalHistory('event-1', 'org-1', {
        page: 1,
        show: 10,
      });

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/history',
        {
          eventId: 'event-1',
          eventOrganizerId: 'org-1',
          limit: '10',
          page: '1'
        },
        'Failed to fetch withdrawal history'
      );
    });

    it('should fetch history with status filter', async () => {
      const mockResponse: WithdrawalHistoryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await withdrawalService.getWithdrawalHistory('event-1', undefined, {
        page: 1,
        show: 10,
        status: 'approved'
      });

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/history',
        {
          eventId: 'event-1',
          limit: '10',
          page: '1',
          status: 'approved'
        },
        'Failed to fetch withdrawal history'
      );
    });

    it('should not include empty eventOrganizerId', async () => {
      const mockResponse: WithdrawalHistoryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await withdrawalService.getWithdrawalHistory('event-1', '   ', {
        page: 1,
        show: 10,
      });

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/history',
        expect.not.objectContaining({
          eventOrganizerId: expect.anything()
        }),
        'Failed to fetch withdrawal history'
      );
    });

    it('should fetch history without filters', async () => {
      const mockResponse: WithdrawalHistoryResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10,
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await withdrawalService.getWithdrawalHistory(
        undefined,
        undefined,
        undefined
      );

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/withdrawal/history',
        {},
        'Failed to fetch withdrawal history'
      );
    });
  });
});
