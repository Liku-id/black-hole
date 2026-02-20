import { PaymentMethod } from '@/hooks/list/usePaymentMethods';
import { CitiesResponse } from '@/types/city';
import { apiUtils } from '@/utils/apiUtils';

import { listService } from './index';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn()
  }
}));

describe('ListService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<typeof apiUtils.get>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCities', () => {
    it('should successfully fetch cities', async () => {
      const mockCitiesResponse: CitiesResponse = {
        message: 'Success',
        body: [
          { id: '1', name: 'Jakarta' },
          { id: '2', name: 'Bandung' }
        ]
      };

      mockApiUtilsGet.mockResolvedValue(mockCitiesResponse);

      const result = await listService.getCities();

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/cities',
        {},
        'Failed to fetch cities'
      );
      expect(result).toEqual(mockCitiesResponse);
    });

    it('should handle error when fetching cities', async () => {
      const mockError = new Error('Network error');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(listService.getCities()).rejects.toThrow('Network error');
      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/cities',
        {},
        'Failed to fetch cities'
      );
    });
  });

  describe('getPaymentMethods', () => {
    it('should successfully fetch and group payment methods', async () => {
      const mockPaymentMethods: PaymentMethod[] = [
        { 
          id: '1', 
          name: 'BCA Virtual Account', 
          type: 'va', 
          logo: '', 
          bankId: '1', 
          requestType: 'POST', 
          paymentCode: 'bca_va', 
          paymentMethodFee: 4000, 
          channelProperties: {}, 
          rules: [], 
          bank: { id: '1', name: 'BCA', channelCode: 'BCA', channelType: 'VA', minAmount: 10000, maxAmount: 10000000 } 
        },
        { 
          id: '2', 
          name: 'BNI Virtual Account', 
          type: 'va', 
          logo: '', 
          bankId: '2', 
          requestType: 'POST', 
          paymentCode: 'bni_va', 
          paymentMethodFee: 4000, 
          channelProperties: {}, 
          rules: [], 
          bank: { id: '2', name: 'BNI', channelCode: 'BNI', channelType: 'VA', minAmount: 10000, maxAmount: 10000000 } 
        },
        { 
          id: '3', 
          name: 'GoPay', 
          type: 'ewallet', 
          logo: '', 
          bankId: '3', 
          requestType: 'POST', 
          paymentCode: 'gopay', 
          paymentMethodFee: 2000, 
          channelProperties: {}, 
          rules: [], 
          bank: { id: '3', name: 'GoPay', channelCode: 'GOPAY', channelType: 'EWALLET', minAmount: 1000, maxAmount: 5000000 } 
        },
        { 
          id: '4', 
          name: 'OVO', 
          type: 'ewallet', 
          logo: '', 
          bankId: '4', 
          requestType: 'POST', 
          paymentCode: 'ovo', 
          paymentMethodFee: 2000, 
          channelProperties: {}, 
          rules: [], 
          bank: { id: '4', name: 'OVO', channelCode: 'OVO', channelType: 'EWALLET', minAmount: 1000, maxAmount: 5000000 } 
        }
      ];

      const mockResponse = {
        statusCode: 200,
        message: 'Success',
        body: mockPaymentMethods
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await listService.getPaymentMethods();

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/list/payment-method',
        {},
        'Failed to fetch payment methods'
      );
      
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Success');
      expect(result.body).toHaveProperty('Virtual Account');
      expect(result.body).toHaveProperty('ewallet');
      expect(result.body['Virtual Account']).toHaveLength(2);
      expect(result.body['ewallet']).toHaveLength(2);
    });

    it('should group VA type as Virtual Account', async () => {
      const mockPaymentMethods: PaymentMethod[] = [
        { 
          id: '1', 
          name: 'Mandiri Virtual Account', 
          type: 'va', 
          logo: '', 
          bankId: '1', 
          requestType: 'POST', 
          paymentCode: 'mandiri_va', 
          paymentMethodFee: 4000, 
          channelProperties: {}, 
          rules: [], 
          bank: { id: '1', name: 'Mandiri', channelCode: 'MANDIRI', channelType: 'VA', minAmount: 10000, maxAmount: 10000000 } 
        }
      ];

      const mockResponse = {
        statusCode: 200,
        message: 'Success',
        body: mockPaymentMethods
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await listService.getPaymentMethods();

      expect(result.body).toHaveProperty('Virtual Account');
      expect(result.body['Virtual Account']).toHaveLength(1);
      expect(result.body['Virtual Account'][0].paymentCode).toBe('mandiri_va');
    });

    it('should handle empty payment methods', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Success',
        body: []
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await listService.getPaymentMethods();

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    it('should use default values if statusCode or message not provided', async () => {
      const mockPaymentMethods: PaymentMethod[] = [
        { 
          id: '1', 
          name: 'BCA Virtual Account', 
          type: 'va', 
          logo: '', 
          bankId: '1', 
          requestType: 'POST', 
          paymentCode: 'bca_va', 
          paymentMethodFee: 4000, 
          channelProperties: {}, 
          rules: [], 
          bank: { id: '1', name: 'BCA', channelCode: 'BCA', channelType: 'VA', minAmount: 10000, maxAmount: 10000000 } 
        }
      ];

      const mockResponse = {
        body: mockPaymentMethods
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await listService.getPaymentMethods();

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Success');
    });

    it('should handle error when fetching payment methods', async () => {
      const mockError = new Error('Failed to fetch');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(listService.getPaymentMethods()).rejects.toThrow('Failed to fetch');
      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/list/payment-method',
        {},
        'Failed to fetch payment methods'
      );
    });
  });
});
