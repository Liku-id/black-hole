import {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse
} from '@/types/auth';
import { EventOrganizerMeResponse } from '@/types/organizer';
import { apiUtils } from '@/utils/apiUtils';

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    console.log('Attempting login with:', { email: data.email });

    try {
      const responseData = await apiUtils.post<LoginResponse>(
        '/api/auth/login',
        data,
        'Login failed'
      );
      return responseData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<LogoutResponse> {
    try {
      return await apiUtils.post<LogoutResponse>(
        '/api/auth/logout',
        {},
        'Logout failed'
      );
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Unable to connect to server. Please check your internet connection and try again.'
        );
      }
      throw error;
    }
  }

  async getMe(): Promise<MeResponse> {
    try {
      return await apiUtils.get<MeResponse>(
        '/api/auth/me',
        undefined,
        'Failed to get user data'
      );
    } catch (error) {
      console.error('Get me error:', error);
      throw error;
    }
  }

  async getEventOrganizerMe(): Promise<EventOrganizerMeResponse> {
    try {
      return await apiUtils.get<EventOrganizerMeResponse>(
        '/api/event-organizers/me',
        undefined,
        'Failed to get event organizer data'
      );
    } catch (error) {
      console.error('Get event organizer me error:', error);
      throw error;
    }
  }

  async updateEventOrganizerGeneral(
    eoId: string,
    data: {
      name: string;
      description: string;
      social_media_url: string;
      address: string;
      asset_id: string;
      organizer_type?: string;
    }
  ): Promise<any> {
    try {
      return await apiUtils.post(
        `/api/event-organizers/${eoId}/general`,
        data,
        'Failed to update event organizer general information'
      );
    } catch (error) {
      console.error('Update event organizer general error:', error);
      throw error;
    }
  }

  async updateEventOrganizerLegal(
    eoId: string,
    data: {
      npwp_photo_id: string;
      npwp_number: string;
      npwp_address: string;
      full_name: string;
      ktp_photo_id?: string;
      ktp_number?: string;
      ktp_address?: string;
      pic_name?: string;
      pic_title?: string;
    }
  ): Promise<any> {
    try {
      return await apiUtils.post(
        `/api/event-organizers/${eoId}/legal`,
        data,
        'Failed to update event organizer legal information'
      );
    } catch (error) {
      console.error('Update event organizer legal error:', error);
      throw error;
    }
  }
}

const authService = new AuthService();

export { authService };
