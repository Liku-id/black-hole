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
}

const authService = new AuthService();

export { authService };
