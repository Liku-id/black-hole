import {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse
} from '@/types/auth';
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

  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    try {
      return await apiUtils.post<LogoutResponse>(
        '/api/auth/logout',
        data,
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
}

const authService = new AuthService();

export { authService };
