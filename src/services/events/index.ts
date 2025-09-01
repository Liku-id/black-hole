import {
  EventDetailResponse,
  EventsFilters,
  EventsResponse,
  CreateEventRequest,
  CreateEventResponse
} from '@/types/event';
import { apiUtils } from '@/utils/apiUtils';

// Events Service
class EventsService {
  async getEvents(filters?: EventsFilters): Promise<EventsResponse> {
    try {
      const params: Record<string, any> = {};

      if (filters?.show) params.show = filters.show.toString();
      if (filters?.page) params.page = filters.page.toString();
      if (filters?.name) params.name = filters.name;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      if (filters?.cityId) params.cityId = filters.cityId;

      return await apiUtils.get(
        '/api/events',
        params,
        'Failed to fetch events'
      );
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async getEventDetail(metaUrl: string): Promise<EventDetailResponse> {
    try {
      return await apiUtils.get(
        `/api/events/${metaUrl}`,
        {},
        'Failed to fetch event detail'
      );
    } catch (error) {
      console.error('Error fetching event detail:', error);
      throw error;
    }
  }

  async createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
    try {
      return await apiUtils.post<CreateEventResponse>(
        '/api/events/create',
        data,
        'Failed to create event'
      );
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }
}

const eventsService = new EventsService();

export { eventsService };
