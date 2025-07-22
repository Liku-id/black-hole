import { EventsFilters, EventsResponse } from '@/types/event';

class EventsService {
  async getEvents(filters?: EventsFilters): Promise<EventsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters?.show) params.append('show', filters.show.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.name) params.append('name', filters.name);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.cityId) params.append('cityId', filters.cityId);

      const queryString = params.toString();
      const url = `/api/events${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch events';

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
      console.error('Error fetching events:', error);
      throw error;
    }
  }
}

export default new EventsService();
