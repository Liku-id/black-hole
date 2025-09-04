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
    console.log('Requesting OTP for:', data.phoneNumber);

    try {
      const responseData = await apiUtils.post<OTPRequestResponse>(
        '/api/auth/otp/request',
        data,
        'OTP request failed'
      );
      console.log('OTP requested successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('OTP request error:', error);
      throw error;
    }
  }

  async verifyOTP(
    data: OTPVerificationRequest
  ): Promise<OTPVerificationResponse> {
    console.log('Verifying OTP');

    try {
      const responseData = await apiUtils.post<OTPVerificationResponse>(
        '/api/auth/otp/verification',
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

  async uploadAsset(data: UploadAssetRequest): Promise<UploadAssetResponse> {
    console.log('Uploading asset');

    try {
      const responseData = await apiUtils.post<UploadAssetResponse>(
        '/api/upload-asset',
        data,
        'Asset upload failed'
      );
      console.log('Asset uploaded successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Asset upload error:', error);
      throw error;
    }
  }

  async createEventOrganizer(
    data: CreateEventOrganizerRequest
  ): Promise<CreateEventOrganizerResponse> {
    console.log('Creating event organizer');

    try {
      const responseData = await apiUtils.post<CreateEventOrganizerResponse>(
        '/api/event-organizers',
        data,
        'Event organizer creation failed'
      );
      console.log('Event organizer created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Event organizer creation error:', error);
      throw error;
    }
  }

  async checkAvailability(
    data: CheckAvailabilityRequest
  ): Promise<CheckAvailabilityResponse> {
    console.log('Checking availability for:', data.email, data.phoneNumber);

    try {
      const responseData = await apiUtils.post<CheckAvailabilityResponse>(
        '/api/users/check-availability',
        data,
        'Availability check failed'
      );
      console.log('Availability check successful:', responseData);
      return responseData;
    } catch (error) {
      console.error('Availability check error:', error);
      throw error;
    }
  }
}

const registerService = new RegisterService();

export { registerService };
