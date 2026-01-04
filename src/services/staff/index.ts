import { apiUtils } from '@/utils/apiUtils';
import {
  ListStaffRequest,
  ListStaffResponse,
  CreateStaffRequest,
  CreateStaffResponse,
  DeleteStaffRequest,
  DeleteStaffResponse
} from '@/types/staff';

export class StaffService {
  async getStaffList(
    eventOrganizerId: string,
    params?: ListStaffRequest
  ): Promise<ListStaffResponse> {
    try {
      return await apiUtils.get<ListStaffResponse>(
        `/api/event-organizers/staff/${eventOrganizerId}`,
        params || {},
        'Failed to fetch staff list'
      );
    } catch (error) {
      console.error('Error fetching staff list:', error);
      throw error;
    }
  }

  async createStaff(data: CreateStaffRequest): Promise<CreateStaffResponse> {
    try {
      return await apiUtils.post<CreateStaffResponse>(
        '/api/event-organizers/staff',
        data,
        'Failed to create staff'
      );
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  async deleteStaff(data: DeleteStaffRequest): Promise<DeleteStaffResponse> {
    try {
      return await apiUtils.post<DeleteStaffResponse>(
        '/api/event-organizers/staff/delete',
        data,
        'Failed to delete staff'
      );
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  }
}

export const staffService = new StaffService();
