import { apiUtils } from '@/utils/apiUtils';

import { utmService, UtmPayload } from './index';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    post: jest.fn()
  }
}));

describe('UtmService', () => {
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<typeof apiUtils.post>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendUtmData', () => {
    it('should successfully send UTM data', async () => {
      const mockUtmPayload: UtmPayload = {
        action: 'page_view',
        campaign: 'summer_sale',
        email: 'user@example.com',
        fullName: 'John Doe',
        medium: 'email',
        phoneNumber: '+628123456789',
        platform: 'web',
        source: 'newsletter',
        timestamp: '2023-12-01T10:00:00Z',
        userId: 'user123',
        amountSpent: '100000'
      };

      const mockResponse = {
        statusCode: 200,
        message: 'UTM data sent successfully',
        body: { id: 'utm-123' }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await utmService.sendUtmData(mockUtmPayload);

      expect(mockApiUtilsPost).toHaveBeenCalledWith('/api/utm', mockUtmPayload);
      expect(result).toEqual(mockResponse);
    });

    it('should send UTM data without optional fields', async () => {
      const mockUtmPayload: UtmPayload = {
        action: 'click',
        campaign: 'winter_sale',
        email: 'user@example.com',
        fullName: 'Jane Doe',
        medium: 'social',
        phoneNumber: '+628987654321',
        platform: 'mobile',
        source: 'facebook',
        timestamp: '2023-12-01T11:00:00Z'
      };

      const mockResponse = {
        statusCode: 200,
        message: 'UTM data sent successfully'
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await utmService.sendUtmData(mockUtmPayload);

      expect(mockApiUtilsPost).toHaveBeenCalledWith('/api/utm', mockUtmPayload);
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when sending UTM data', async () => {
      const mockUtmPayload: UtmPayload = {
        action: 'purchase',
        campaign: 'test_campaign',
        email: 'test@example.com',
        fullName: 'Test User',
        medium: 'organic',
        phoneNumber: '+628111111111',
        platform: 'web',
        source: 'google',
        timestamp: '2023-12-01T12:00:00Z'
      };

      const mockError = new Error('Network error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(utmService.sendUtmData(mockUtmPayload)).rejects.toThrow('Network error');
      expect(mockApiUtilsPost).toHaveBeenCalledWith('/api/utm', mockUtmPayload);
    });

    it('should handle server error', async () => {
      const mockUtmPayload: UtmPayload = {
        action: 'signup',
        campaign: 'onboarding',
        email: 'newuser@example.com',
        fullName: 'New User',
        medium: 'direct',
        phoneNumber: '+628222222222',
        platform: 'web',
        source: 'website',
        timestamp: '2023-12-01T13:00:00Z'
      };

      const mockError = new Error('Server error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(utmService.sendUtmData(mockUtmPayload)).rejects.toThrow('Server error');
    });
  });
});
