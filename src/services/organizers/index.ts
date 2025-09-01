import { EventOrganizersResponse } from '@/types/organizer';
import { apiUtils } from '@/utils/apiUtils';

class OrganizersService {
  async getEventOrganizers(): Promise<EventOrganizersResponse> {
    try {
      return await apiUtils.get<EventOrganizersResponse>(
        '/api/organizers',
        {},
        'Failed to fetch event organizers'
      );
    } catch (error) {
      console.error('Error fetching event organizers:', error);
      throw error;
    }
  }
}

const organizersService = new OrganizersService();

export { organizersService };
