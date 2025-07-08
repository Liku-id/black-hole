import { ErrorResponse, EventOrganizersResponse } from '@/models/organizer';
import { API_BASE_URL, API_OPTIONS, DEFAULT_HEADERS } from './config';
import { ApiError } from './error';

/**
 * Event Organizers API service
 * Handles event organizer-related operations
 */
export const organizersApi = {
  /**
   * Get all event organizers
   * @returns Promise with organizers data
   */
  async getEventOrganizers(): Promise<EventOrganizersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/event-organizers`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        ...API_OPTIONS
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