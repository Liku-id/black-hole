import { apiUtils } from '@/utils/apiUtils';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

class ForgotPasswordService {
  async requestReset(data: ForgotPasswordRequest): Promise<void> {
    await apiUtils.post(
      '/api/auth/password/request',
      data,
      'Failed to send password reset email'
    );
  }

  async changePassword(data: ResetPasswordRequest): Promise<void> {
    await apiUtils.post(
      '/api/auth/password/change',
      data,
      'Failed to reset password'
    );
  }
}

export const forgotPasswordService = new ForgotPasswordService();

