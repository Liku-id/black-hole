import { TicketsFilters, TicketsResponse } from '@/types/ticket';

class TicketsService {
  async getTickets(filters: TicketsFilters): Promise<TicketsResponse> {
    try {
      const params = new URLSearchParams();

      // Required parameters
      params.append('eventId', filters.eventId);

      // Optional parameters
      if (filters.page !== undefined)
        params.append('page', filters.page.toString());
      if (filters.show !== undefined)
        params.append('show', filters.show.toString());
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/tickets${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch tickets';

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
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
      return responseData;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }
}

export default new TicketsService();
