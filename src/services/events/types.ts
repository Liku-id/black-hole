import { EventTypesResponse } from '@/types/event';
import { apiUtils } from '@/utils';

class EventTypesService {
  async getEventTypes(): Promise<EventTypesResponse> {
    const response = await apiUtils.get('/api/event-types');
    return response;
  }
}

const eventTypesService = new EventTypesService();

export { eventTypesService };
