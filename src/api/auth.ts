import { canAccessAdmin, getRoleName } from '@/models/roles';
import { ApiErrorResponse, AuthUser, LoginDto, LoginResponse, LogoutResponse } from '@/models/user';
import { API_BASE_URL, API_OPTIONS, DEFAULT_HEADERS } from './config';
import { ApiError } from './error';

/**
 * Authentication API service
 * Handles login and logout operations
 */
export const authApi = {
  /**
   * Authenticate user with email and password
   * @param loginData - Login credentials
   * @returns Promise with user data or error
   */
  async login(loginData: LoginDto): Promise<{ user: AuthUser; error?: string }> {
    try {
      // Client-side logging (appears in browser console)
      console.log('🔄 [CLIENT] Attempting login with:', { email: loginData.email });
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(loginData),
        ...API_OPTIONS
      });

      console.log('📡 [CLIENT] Login response status:', response.status);

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        console.error('❌ [CLIENT] Login error:', errorData);
        throw new ApiError(
          errorData.statusCode,
          errorData.message
        );
      }

      const data: LoginResponse = await response.json();
      console.log('✅ [CLIENT] Login successful:', { 
        userId: data.body.user.id, 
        email: data.body.user.email,
        roleId: data.body.user.roleId,
        roleName: getRoleName(data.body.user.roleId)
      });
      
      // Check if user has admin access
      if (!canAccessAdmin(data.body.user.roleId)) {
        console.log('🚫 [CLIENT] Access denied: User is not admin');
        throw new ApiError(
          403,
          'Access denied. Only administrators can access this system.'
        );
      }
      
      // Create AuthUser object
      const authUser: AuthUser = {
        ...data.body.user,
        accessToken: data.body.accessToken,
        refreshToken: data.body.refreshToken
      };

      console.log('🎉 [CLIENT] Login completed successfully for admin user');
      return { user: authUser };
    } catch (error) {
      console.error('💥 [CLIENT] Login error:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle CORS errors specifically
      if (error instanceof TypeError && error.message.includes('CORS')) {
        throw new ApiError(
          0,
          'CORS error: Backend needs to allow requests from http://localhost:3000'
        );
      }

      throw new ApiError(500, 'Network error occurred');
    }
  },

  /**
   * Logout user from the system
   * @param userId - User ID to logout
   * @returns Promise<void>
   */
  async logout(userId: string): Promise<void> {
    try {
      console.log('🔄 [CLIENT] Attempting logout for user:', userId);
      
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ userId }),
        ...API_OPTIONS
      });

      console.log('📡 [CLIENT] Logout response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [CLIENT] Logout error:', errorData);
        throw new ApiError(
          response.status,
          errorData.message || 'Logout failed'
        );
      }

      const data: LogoutResponse = await response.json();
      console.log('✅ [CLIENT] Logout successful:', data);
      
    } catch (error) {
      console.error('💥 [CLIENT] Logout error:', error);
      // Don't throw error for logout - always clear tokens
    } finally {
      // Token clearing is handled by the calling hook
    }
  }
}; 