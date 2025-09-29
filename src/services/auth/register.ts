import {
  OTPRequestRequest,
  OTPRequestResponse,
  OTPVerificationRequest,
  OTPVerificationResponse,
  UploadAssetRequest,
  UploadAssetResponse,
  CreateEventOrganizerRequest,
  CreateEventOrganizerResponse,
  CheckAvailabilityRequest,
  CheckAvailabilityResponse
} from '@/types/register';
import { apiUtils } from '@/utils/apiUtils';

class RegisterService {
  async requestOTP(data: OTPRequestRequest): Promise<OTPRequestResponse> {

    try {
      const responseData = await apiUtils.post<OTPRequestResponse>(
        '/api/auth/otp/request',
        data,
        'OTP request failed'
      );
      return responseData;
    } catch (error) {
      console.error('OTP request error:', error);
      throw error;
    }
  }

  async verifyOTP(
    data: OTPVerificationRequest
  ): Promise<OTPVerificationResponse> {

    try {
      const responseData = await apiUtils.post<OTPVerificationResponse>(
        '/api/auth/otp/verification',
        data,
        'OTP verification failed'
      );
      return responseData;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  async uploadAsset(data: UploadAssetRequest): Promise<UploadAssetResponse> {

    try {
      const responseData = await apiUtils.post<UploadAssetResponse>(
        '/api/upload-asset',
        data,
        'Asset upload failed'
      );
      return responseData;
    } catch (error) {
      console.error('Asset upload error:', error);
      throw error;
    }
  }

  async createEventOrganizer(
    data: CreateEventOrganizerRequest
  ): Promise<CreateEventOrganizerResponse> {

    try {
      const responseData = await apiUtils.post<CreateEventOrganizerResponse>(
        '/api/event-organizers',
        data,
        'Event organizer creation failed'
      );
      return responseData;
    } catch (error) {
      console.error('Event organizer creation error:', error);
      throw error;
    }
  }

  async checkAvailability(
    data: CheckAvailabilityRequest
  ): Promise<CheckAvailabilityResponse> {
    try {
      const responseData = await apiUtils.post<CheckAvailabilityResponse>(
        '/api/users/check-availability',
        data,
        'Availability check failed'
      );
      return responseData;
    } catch (error) {
      throw error;
    }
  }
}

const registerService = new RegisterService();

export { registerService };
