import { apiUtils } from '@/utils/apiUtils';

import { forgotPasswordService, ForgotPasswordRequest, ResetPasswordRequest } from './forgot-password';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    post: jest.fn()
  }
}));

describe('ForgotPasswordService', () => {
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<typeof apiUtils.post>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestReset', () => {
    it('should successfully request password reset', async () => {
      const mockRequest: ForgotPasswordRequest = {
        email: 'test@example.com'
      };

      mockApiUtilsPost.mockResolvedValue({
        statusCode: 200,
        message: 'Password reset email sent'
      });

      await forgotPasswordService.requestReset(mockRequest);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/auth/password/request',
        mockRequest,
        'Failed to send password reset email'
      );
    });

    it('should handle error when requesting password reset', async () => {
      const mockRequest: ForgotPasswordRequest = {
        email: 'nonexistent@example.com'
      };

      const mockError = new Error('User not found');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(forgotPasswordService.requestReset(mockRequest)).rejects.toThrow('User not found');
      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/auth/password/request',
        mockRequest,
        'Failed to send password reset email'
      );
    });

    it('should handle network error', async () => {
      const mockRequest: ForgotPasswordRequest = {
        email: 'test@example.com'
      };

      const mockError = new Error('Network error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(forgotPasswordService.requestReset(mockRequest)).rejects.toThrow('Network error');
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const mockRequest: ResetPasswordRequest = {
        email: 'test@example.com',
        token: 'valid-reset-token',
        newPassword: 'newPassword123!'
      };

      mockApiUtilsPost.mockResolvedValue({
        statusCode: 200,
        message: 'Password changed successfully'
      });

      await forgotPasswordService.changePassword(mockRequest);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/auth/password/change',
        mockRequest,
        'Failed to reset password'
      );
    });

    it('should handle error with invalid token', async () => {
      const mockRequest: ResetPasswordRequest = {
        email: 'test@example.com',
        token: 'invalid-token',
        newPassword: 'newPassword123!'
      };

      const mockError = new Error('Invalid or expired token');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(forgotPasswordService.changePassword(mockRequest)).rejects.toThrow('Invalid or expired token');
      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/auth/password/change',
        mockRequest,
        'Failed to reset password'
      );
    });

    it('should handle error with weak password', async () => {
      const mockRequest: ResetPasswordRequest = {
        email: 'test@example.com',
        token: 'valid-reset-token',
        newPassword: '123'
      };

      const mockError = new Error('Password too weak');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(forgotPasswordService.changePassword(mockRequest)).rejects.toThrow('Password too weak');
    });

    it('should handle server error', async () => {
      const mockRequest: ResetPasswordRequest = {
        email: 'test@example.com',
        token: 'valid-reset-token',
        newPassword: 'newPassword123!'
      };

      const mockError = new Error('Server error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(forgotPasswordService.changePassword(mockRequest)).rejects.toThrow('Server error');
    });
  });
});
