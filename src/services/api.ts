import { EventOrganizersResponse, ErrorResponse } from '@/models/organizer';

// Use proxy in development to avoid CORS issues
const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? '/api/v1'
    : 'http://localhost:8080/v1';

export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const eventOrganizersApi = {
  async getEventOrganizers(): Promise<EventOrganizersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/event-organizers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new ApiError(
          errorData.code,
          errorData.message,
          errorData.details
        );
      }

      const data: EventOrganizersResponse = await response.json();
      return data;
    } catch (error) {
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
  }
};
