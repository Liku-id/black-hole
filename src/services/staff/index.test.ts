import {
  ListStaffRequest,
  ListStaffResponse,
  CreateStaffRequest,
  CreateStaffResponse,
  DeleteStaffRequest,
  DeleteStaffResponse
} from '@/types/staff';
import { apiUtils } from '@/utils/apiUtils';

import { staffService } from './index';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('StaffService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<
    typeof apiUtils.get
  >;
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<
    typeof apiUtils.post
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStaffList', () => {
    it('should successfully fetch staff list without params', async () => {
      const mockResponse: ListStaffResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          staff: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            limit: 10,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await staffService.getStaffList('org-1');

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/event-organizers/staff/org-1',
        {},
        'Failed to fetch staff list'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch staff list with pagination params', async () => {
      const params: ListStaffRequest = {
        page: 2,
        limit: 20
      };

      const mockResponse: ListStaffResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          staff: [
            {
              id: 'staff-1',
              fullName: 'John Doe',
              email: 'john@example.com',
              phoneNumber: '+628123456789',
              role: {
                id: 'role-1',
                name: 'Staff'
              },
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01'
            } as any
          ],
          pagination: {
            totalRecords: 25,
            totalPages: 2,
            page: 2,
            limit: 20,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await staffService.getStaffList('org-1', params);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/event-organizers/staff/org-1',
        params,
        'Failed to fetch staff list'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch staff list with search param', async () => {
      const params: ListStaffRequest = {
        search: 'John',
        page: 1,
        limit: 10
      };

      const mockResponse: ListStaffResponse = {
        status_code: 200,
        message: 'Success',
        body: {
          staff: [
            {
              id: 'staff-1',
              fullName: 'John Doe',
              email: 'john@example.com'
            } as any
          ],
          pagination: {
            totalRecords: 1,
            totalPages: 1,
            page: 1,
            limit: 10,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await staffService.getStaffList('org-1', params);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/event-organizers/staff/org-1',
        params,
        'Failed to fetch staff list'
      );
    });

    it('should handle error when fetching staff list', async () => {
      const mockError = new Error('Network error');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(staffService.getStaffList('org-1')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle error when organizer not found', async () => {
      const mockError = new Error('Organizer not found');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(
        staffService.getStaffList('invalid-org-id')
      ).rejects.toThrow('Organizer not found');
    });
  });

  describe('createStaff', () => {
    it('should successfully create staff', async () => {
      const staffData: CreateStaffRequest = {
        event_organizer_id: 'org-1',
        email: 'newstaff@example.com',
        full_name: 'Jane Smith',
        role: 'staff'
      };

      const mockResponse: CreateStaffResponse = {
        status_code: 201,
        message: 'Staff created successfully',
        body: {
          id: 'staff-2',
          full_name: 'Jane Smith',
          email: 'newstaff@example.com',
          phone_number: '+628987654321',
          role_id: 'role-1',
          role_name: 'Staff',
          event_organizer_id: 'org-1',
          created_at: '2024-02-01'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await staffService.createStaff(staffData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/event-organizers/staff',
        staffData,
        'Failed to create staff'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create staff with minimal data', async () => {
      const staffData: CreateStaffRequest = {
        event_organizer_id: 'org-1',
        email: 'staff@example.com',
        full_name: 'Staff Member',
        role: 'staff'
      };

      const mockResponse: CreateStaffResponse = {
        status_code: 201,
        message: 'Staff created successfully',
        body: {
          id: 'staff-3',
          full_name: 'Staff Member',
          email: 'staff@example.com',
          phone_number: '+628111222333',
          role_id: 'role-1',
          role_name: 'Staff',
          event_organizer_id: 'org-1',
          created_at: '2024-02-01'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      await staffService.createStaff(staffData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/event-organizers/staff',
        staffData,
        'Failed to create staff'
      );
    });

    it('should handle error when creating staff with duplicate email', async () => {
      const staffData: CreateStaffRequest = {
        event_organizer_id: 'org-1',
        email: 'existing@example.com',
        full_name: 'Duplicate Staff',
        role: 'staff'
      };

      const mockError = new Error('Email already exists');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(staffService.createStaff(staffData)).rejects.toThrow(
        'Email already exists'
      );
    });

    it('should handle validation error', async () => {
      const staffData: CreateStaffRequest = {
        event_organizer_id: '',
        email: 'invalid-email',
        full_name: '',
        role: ''
      };

      const mockError = new Error('Validation error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(staffService.createStaff(staffData)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  describe('deleteStaff', () => {
    it('should successfully delete staff', async () => {
      const deleteData: DeleteStaffRequest = {
        user_id: 'staff-1',
        reason: 'No longer needed'
      };

      const mockResponse: DeleteStaffResponse = {
        status_code: 200,
        message: 'Staff deleted successfully'
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await staffService.deleteStaff(deleteData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/event-organizers/staff/delete',
        deleteData,
        'Failed to delete staff'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should delete staff from specific organizer', async () => {
      const deleteData: DeleteStaffRequest = {
        user_id: 'staff-5',
        reason: 'Resigned'
      };

      const mockResponse: DeleteStaffResponse = {
        status_code: 200,
        message: 'Staff deleted successfully'
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      await staffService.deleteStaff(deleteData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/event-organizers/staff/delete',
        deleteData,
        'Failed to delete staff'
      );
    });

    it('should handle error when deleting non-existent staff', async () => {
      const deleteData: DeleteStaffRequest = {
        user_id: 'invalid-staff-id'
      };

      const mockError = new Error('Staff not found');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(staffService.deleteStaff(deleteData)).rejects.toThrow(
        'Staff not found'
      );
    });

    it('should handle error when organizer not found', async () => {
      const deleteData: DeleteStaffRequest = {
        user_id: 'staff-1'
      };

      const mockError = new Error('Organizer not found');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(staffService.deleteStaff(deleteData)).rejects.toThrow(
        'Organizer not found'
      );
    });

    it('should handle permission error', async () => {
      const deleteData: DeleteStaffRequest = {
        user_id: 'staff-1'
      };

      const mockError = new Error('Permission denied');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(staffService.deleteStaff(deleteData)).rejects.toThrow(
        'Permission denied'
      );
    });
  });
});
