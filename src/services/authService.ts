import { LoginRequest, LoginResponse, LogoutRequest, LogoutResponse } from '@/types/auth';

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    console.log('Attempting login with:', { email: data.email });
    
    try {
      // Use Next.js API route proxy instead of direct backend call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        
        try {
          const errorData = await response.json();
          console.log('Error response:', errorData);
          
          // Handle different error response formats
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.details && errorData.details.length > 0) {
            errorMessage = errorData.details.join(', ');
          } else {
            errorMessage = `Server error (${response.status})`;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Login successful:', responseData);
      return responseData;
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during login.');
      }
    }
  }

  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    try {
      // Use Next.js API route proxy instead of direct backend call
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'Logout failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Logout failed with status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
