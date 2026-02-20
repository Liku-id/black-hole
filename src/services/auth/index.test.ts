import { LoginRequest, LoginResponse, LogoutResponse, MeResponse, RefreshTokenResponse, UserRole } from '@/types/auth';
import { EventOrganizerMeResponse } from '@/types/organizer';
import { apiUtils } from '@/utils/apiUtils';

import { authService } from './index';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    post: jest.fn(),
    get: jest.fn()
  }
}));

describe('AuthService', () => {
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<typeof apiUtils.post>;
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<typeof apiUtils.get>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockLoginResponse: LoginResponse = {
        message: 'Login successful',
        body: {
          user: {
            id: '1',
            fullName: 'Test User',
            email: 'test@example.com',
            role: UserRole.GUEST,
            phoneNumber: '081234567890',
            ktpNumber: '1234567890123456',
            dateOfBirth: '1990-01-01',
            gender: 'male',
            roleId: '1',
            isVerified: true,
            profilePictureId: 'pic-id',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            isGuest: true
          }
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockLoginResponse);

      const result = await authService.login(loginRequest);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/auth/login',
        loginRequest,
        'Login failed'
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should handle login error', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockError = new Error('Invalid credentials');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(authService.login(loginRequest)).rejects.toThrow('Invalid credentials');
      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/auth/login',
        loginRequest,
        'Login failed'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockLogoutResponse: LogoutResponse = {
        success: true,
        message: 'Logout successful'
      };

      mockApiUtilsPost.mockResolvedValue(mockLogoutResponse);

      const result = await authService.logout();

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/auth/logout',
        {},
        'Logout failed'
      );
      expect(result).toEqual(mockLogoutResponse);
    });

    it('should handle TypeError on network failure', async () => {
      const mockError = new TypeError('fetch failed');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(authService.logout()).rejects.toThrow(
        'Unable to connect to server. Please check your internet connection and try again.'
      );
    });

    it('should handle other errors', async () => {
      const mockError = new Error('Server error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(authService.logout()).rejects.toThrow('Server error');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockRefreshResponse: RefreshTokenResponse = {
        statusCode: 200,
        message: 'Token refreshed',
        body: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockRefreshResponse);

      const result = await authService.refreshToken();

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/auth/refresh-token',
        undefined,
        'Failed to refresh token'
      );
      expect(result).toEqual(mockRefreshResponse);
    });

    it('should handle refresh token error', async () => {
      const mockError = new Error('Token expired');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(authService.refreshToken()).rejects.toThrow('Token expired');
    });
  });

  describe('getMe', () => {
    it('should successfully get user data', async () => {
      const mockMeResponse: MeResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          id: '1',
          fullName: 'Test User',
          email: 'test@example.com',
          phoneNumber: '081234567890',
          ktpNumber: '1234567890123456',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          isVerified: true,
          isGuest: false,
          role: {
            id: '1',
            name: 'buyer'
          },
          profilePicture: {
            id: 'pic-id',
            url: 'https://example.com/pic.jpg'
          },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockMeResponse);

      const result = await authService.getMe();

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/auth/me',
        undefined,
        'Failed to get user data'
      );
      expect(result).toEqual(mockMeResponse);
    });

    it('should handle get me error', async () => {
      const mockError = new Error('Unauthorized');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(authService.getMe()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getEventOrganizerMe', () => {
    it('should successfully get event organizer data', async () => {
      const mockOrganizerResponse: EventOrganizerMeResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          id: '1',
          bank_information_id: 'bank-info-1',
          name: 'Test Organizer',
          email: 'organizer@example.com',
          phone_number: '081234567890',
          asset_id: 'asset-1',
          description: 'Test description',
          social_media_url: 'https://instagram.com/testorganizer',
          address: 'Test Address',
          pic_title: 'Mr.',
          ktp_photo_id: 'ktp-1',
          npwp_photo_id: 'npwp-1',
          user_id: 'user-1',
          nik: '1234567890123456',
          npwp: '123456789012345',
          xenplatform_id: 'xen-1',
          organizer_type: 'individual',
          npwp_address: 'NPWP Address',
          ktp_address: 'KTP Address',
          full_name: 'Test Organizer Full Name',
          pic_name: 'PIC Name',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          deleted_at: null,
          bank_information: {
            id: 'bank-info-1',
            bankId: 'bank-1',
            accountNumber: '1234567890',
            accountHolderName: 'Test Account',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
            deletedAt: null,
            bank: {
              id: 'bank-1',
              name: 'Test Bank',
              logo: '',
              channelCode: 'TEST',
              channelType: 'VA',
              minAmount: 10000,
              maxAmount: 10000000
            }
          },
          event_organizer_pic: null,
          asset: null,
          ktpPhoto: null,
          npwpPhoto: null
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockOrganizerResponse);

      const result = await authService.getEventOrganizerMe();

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/event-organizers/me',
        undefined,
        'Failed to get event organizer data'
      );
      expect(result).toEqual(mockOrganizerResponse);
    });

    it('should handle get event organizer me error', async () => {
      const mockError = new Error('Not found');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(authService.getEventOrganizerMe()).rejects.toThrow('Not found');
    });
  });
});
