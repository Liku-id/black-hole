import { apiUtils } from '@/utils/apiUtils';
import { ListStaffRequest, ListStaffResponse } from '@/types/staff';

export class StaffService {
  async getStaffList(
    eventOrganizerId: string,
    params?: ListStaffRequest
  ): Promise<ListStaffResponse> {
    try {
      return await apiUtils.get<ListStaffResponse>(
        `/api/event-organizers/${eventOrganizerId}/staff`,
        params || {},
        'Failed to fetch staff list'
      );
    } catch (error) {
      console.error('Error fetching staff list:', error);
      throw error;
    }
  }
}

export const staffService = new StaffService();
