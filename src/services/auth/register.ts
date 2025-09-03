import {
  RegisterRequest,
  RegisterResponse,
  RegisterProfileRequest,
  OTPVerificationRequest,
  OTPVerificationResponse,
  ResendOTPRequest,
  ResendOTPResponse
} from '@/types/register';
import { apiUtils } from '@/utils/apiUtils';

class RegisterService {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    console.log('Attempting registration with:', {
      organizerName: data.organizerName,
      email: data.email,
      phoneNumber: data.phoneNumber
    });

    try {
      const responseData = await apiUtils.post<RegisterResponse>(
        '/api/auth/register',
        data,
        'Registration failed'
      );
      console.log('Registration successful:', responseData);
      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async submitProfile(data: RegisterProfileRequest): Promise<any> {
    console.log('Submitting profile data');

    try {
      const responseData = await apiUtils.post<any>(
        '/api/auth/submit-profile',
        data,
        'Profile submission failed'
      );
      console.log('Profile submitted successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Profile submission error:', error);
      throw error;
    }
  }

  async verifyOTP(
    data: OTPVerificationRequest
  ): Promise<OTPVerificationResponse> {
    console.log('Verifying OTP');

    try {
      const responseData = await apiUtils.post<OTPVerificationResponse>(
        '/api/auth/verify-otp',
        data,
        'OTP verification failed'
      );
      console.log('OTP verified successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    console.log('Resending OTP');

    try {
      const responseData = await apiUtils.post<ResendOTPResponse>(
        '/api/auth/resend-otp',
        data,
        'Failed to resend OTP'
      );
      console.log('OTP resent successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }
}

const registerService = new RegisterService();

export { registerService };
