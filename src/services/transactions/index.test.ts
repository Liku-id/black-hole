import axios from 'axios';

import {
  TransactionsResponse,
  TransactionsFilters,
  TransactionSummary,
  ExportTransactionsRequest
} from '@/types/transaction';
import { apiUtils } from '@/utils/apiUtils';

import { transactionsService } from './index';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as unknown as jest.Mock;
const mockedIsAxiosError = jest.fn();
(axios as any).isAxiosError = mockedIsAxiosError;

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    handleAxiosError: jest.fn()
  }
}));

describe('TransactionsService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<
    typeof apiUtils.get
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventTransactions', () => {
    it('should successfully fetch event transactions with minimal filters', async () => {
      const filters: TransactionsFilters = {
        eventId: 'event-1'
      };

      const mockResponse: TransactionsResponse = {
        statusCode: 200,
        message: 'Success',
        transactions: [],
        pagination: {
          totalRecords: 0,
          totalPages: 0,
          page: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await transactionsService.getEventTransactions(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/transactions/event-1',
        {},
        'Failed to fetch event transactions'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch event transactions with all filters', async () => {
      const filters: TransactionsFilters = {
        eventId: 'event-1',
        page: 2,
        show: 20,
        partnerId: 'partner-1',
        search: 'John Doe',
        status: 'completed'
      };

      const mockResponse: TransactionsResponse = {
        statusCode: 200,
        message: 'Success',
        transactions: [
          {
            id: 'txn-1',
            amount: 50000,
            status: 'completed'
          } as any
        ],
        pagination: {
          totalRecords: 1,
          totalPages: 1,
          page: 2,
          limit: 20,
          hasNext: false,
          hasPrev: false
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await transactionsService.getEventTransactions(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/transactions/event-1',
        {
          page: '2',
          limit: '20',
          partnerId: 'partner-1',
          search: 'John Doe',
          status: 'completed'
        },
        'Failed to fetch event transactions'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle pagination filters correctly', async () => {
      const filters: TransactionsFilters = {
        eventId: 'event-1',
        page: 5,
        show: 50
      };

      const mockResponse: TransactionsResponse = {
        statusCode: 200,
        message: 'Success',
        transactions: [],
        pagination: {
          totalRecords: 0,
          totalPages: 0,
          page: 5,
          limit: 50,
          hasNext: false,
          hasPrev: false
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await transactionsService.getEventTransactions(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/transactions/event-1',
        expect.objectContaining({
          page: '5',
          limit: '50'
        }),
        'Failed to fetch event transactions'
      );
    });

    it('should handle error when fetching event transactions', async () => {
      const filters: TransactionsFilters = {
        eventId: 'event-1'
      };

      const mockError = new Error('Network error');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(
        transactionsService.getEventTransactions(filters)
      ).rejects.toThrow('Network error');
    });
  });

  describe('exportTransactions', () => {
    // Mock DOM APIs
    let mockAnchor: any;
    let mockCreateObjectURL: jest.Mock;
    let mockRevokeObjectURL: jest.Mock;

    beforeEach(() => {
      // Mock document.createElement
      mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);

      // Mock appendChild and removeChild
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);

      // Mock URL methods
      mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      mockRevokeObjectURL = jest.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock setTimeout to run immediately
      jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return 0 as any;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should successfully export transactions with all parameters', async () => {
      const request: ExportTransactionsRequest = {
        from_date: '2024-01-01',
        to_date: '2024-12-31',
        payment_status: 'completed',
        event_id: 'event-1'
      };

      const mockCsvData = 'id,name,amount\n1,Test,50000';
      mockedAxios.mockResolvedValue({
        data: mockCsvData,
        headers: { 'content-type': 'text/csv' }
      } as any);

      await transactionsService.exportTransactions(request, 'Test Event 2024');

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/transactions-export',
        params: {
          from_date: '2024-01-01',
          to_date: '2024-12-31',
          payment_status: 'completed',
          event_id: 'event-1'
        },
        responseType: 'blob',
        withCredentials: true,
        timeout: 30000
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toMatch(/^transactions_Test_Event_2024_\d{8}_\d{6}\.csv$/);
    });

    it('should export transactions with minimal parameters', async () => {
      const request: ExportTransactionsRequest = {};

      const mockCsvData = 'id,name\n';
      mockedAxios.mockResolvedValue({
        data: mockCsvData,
        headers: { 'content-type': 'text/csv' }
      } as any);

      await transactionsService.exportTransactions(request);

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/transactions-export',
        params: {},
        responseType: 'blob',
        withCredentials: true,
        timeout: 30000
      });

      expect(mockAnchor.download).toMatch(/^transactions_all_events_\d{8}_\d{6}\.csv$/);
    });

    it('should export transactions with partial parameters', async () => {
      const request: ExportTransactionsRequest = {
        from_date: '2024-01-01',
        payment_status: 'completed'
      };

      mockedAxios.mockResolvedValue({
        data: 'test',
        headers: {}
      } as any);

      await transactionsService.exportTransactions(request, 'Event Name');

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            from_date: '2024-01-01',
            payment_status: 'completed'
          }
        })
      );
    });

    it('should sanitize event name in filename', async () => {
      const request: ExportTransactionsRequest = {};

      mockedAxios.mockResolvedValue({
        data: 'test',
        headers: {}
      } as any);

      await transactionsService.exportTransactions(
        request,
        'Event@Name#with$Special%Characters!'
      );

      expect(mockAnchor.download).toMatch(/^transactions_EventNamewithSpecialCharacters_/);
    });

    it('should use default content-type when not provided', async () => {
      const request: ExportTransactionsRequest = {};

      mockedAxios.mockResolvedValue({
        data: 'test',
        headers: {}
      } as any);

      await transactionsService.exportTransactions(request);

      // Verify Blob was created with default content type
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('should handle axios error with apiUtils.handleAxiosError', async () => {
      const request: ExportTransactionsRequest = {};
      const axiosError = {
        isAxiosError: true,
        response: { status: 500 }
      };

      mockedAxios.mockRejectedValue(axiosError);
      mockedIsAxiosError.mockReturnValue(true);
      (apiUtils.handleAxiosError as jest.Mock).mockReturnValue(
        new Error('Export failed')
      );

      await expect(
        transactionsService.exportTransactions(request)
      ).rejects.toThrow();

      expect(apiUtils.handleAxiosError).toHaveBeenCalledWith(
        axiosError,
        'Failed to export transactions'
      );
    });

    it('should handle non-axios errors', async () => {
      const request: ExportTransactionsRequest = {};
      const genericError = new Error('Network error');

      mockedAxios.mockRejectedValue(genericError);
      mockedIsAxiosError.mockReturnValue(false);

      await expect(
        transactionsService.exportTransactions(request)
      ).rejects.toThrow('Network error');

      expect(apiUtils.handleAxiosError).not.toHaveBeenCalled();
    });

    it('should cleanup DOM elements after download', async () => {
      const request: ExportTransactionsRequest = {};

      mockedAxios.mockResolvedValue({
        data: 'test',
        headers: {}
      } as any);

      await transactionsService.exportTransactions(request);

      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle event names with multiple spaces', async () => {
      const request: ExportTransactionsRequest = {};

      mockedAxios.mockResolvedValue({
        data: 'test',
        headers: {}
      } as any);

      await transactionsService.exportTransactions(request, 'Event    With    Spaces');

      expect(mockAnchor.download).toMatch(/^transactions_Event_With_Spaces_/);
    });
  });

  describe('getTransactionSummary', () => {
    it('should successfully fetch transaction summary', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          total_ticket_sold: '150',
          total_payment: '7500000',
          total_withdrawal: '5000000',
          available_balance: '2500000'
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result: TransactionSummary =
        await transactionsService.getTransactionSummary('event-1');

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/transactions/event-1/summary',
        {},
        'Failed to fetch transaction summary'
      );

      expect(result).toEqual({
        ticketSales: {
          total: 150,
          amount: 7500000
        },
        payment: 7500000,
        withdrawal: 5000000,
        balance: 2500000
      });
    });

    it('should handle missing summary data', async () => {
      const mockResponse = {
        statusCode: 200,
        body: null
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await transactionsService.getTransactionSummary('event-1');

      expect(result).toEqual({
        ticketSales: {
          total: 0,
          amount: 0
        },
        payment: 0,
        withdrawal: 0,
        balance: 0
      });
    });

    it('should handle partial summary data', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          total_ticket_sold: '50',
          total_payment: '2500000'
          // missing total_withdrawal and available_balance
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await transactionsService.getTransactionSummary('event-1');

      expect(result).toEqual({
        ticketSales: {
          total: 50,
          amount: 2500000
        },
        payment: 2500000,
        withdrawal: 0,
        balance: 0
      });
    });

    it('should handle invalid numeric values', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          total_ticket_sold: 'invalid',
          total_payment: 'not-a-number',
          total_withdrawal: '',
          available_balance: null
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await transactionsService.getTransactionSummary('event-1');

      expect(result).toEqual({
        ticketSales: {
          total: NaN,
          amount: NaN
        },
        payment: NaN,
        withdrawal: 0,
        balance: 0
      });
    });

    it('should handle error when fetching transaction summary', async () => {
      const mockError = new Error('Not found');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(
        transactionsService.getTransactionSummary('event-1')
      ).rejects.toThrow('Not found');
    });
  });
});
