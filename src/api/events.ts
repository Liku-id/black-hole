import { EventErrorResponse, EventListResponse } from '@/models/event';
import { API_BASE_URL, API_OPTIONS, DEFAULT_HEADERS } from './config';
import { ApiError } from './error';

/**
 * Events API service
 * Handles event-related operations
 */
export const eventsApi = {
  /**
   * Get all events
   * @returns Promise with events data
   */
  async getEvents(): Promise<EventListResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        ...API_OPTIONS
      });

      if (!response.ok) {
        const errorData: EventErrorResponse = await response.json();
        throw new ApiError(
          errorData.code,
          errorData.message,
          errorData.details
        );
      }

      const data: EventListResponse = await response.json();
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