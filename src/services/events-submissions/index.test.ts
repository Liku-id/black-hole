import {
  EventSubmissionsFilters,
  EventSubmissionsResponse
} from '@/types/events-submission';
import { apiUtils } from '@/utils/apiUtils';

import { eventSubmissionsService } from './index';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('EventSubmissionsService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<
    typeof apiUtils.get
  >;
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<
    typeof apiUtils.post
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventSubmissions', () => {
    it('should successfully fetch event submissions without filters', async () => {
      const mockResponse: EventSubmissionsResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await eventSubmissionsService.getEventSubmissions();

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/events-submissions',
        {},
        'Failed to fetch event submissions'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch event submissions with all filters', async () => {
      const filters: EventSubmissionsFilters = {
        show: 20,
        page: 2,
        search: 'Concert',
        type: 'new'
      };

      const mockResponse: EventSubmissionsResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [
            {
              id: 'submission-1',
              eventName: 'Concert Event',
              status: 'pending'
            } as any
          ],
          pagination: {
            totalRecords: 1,
            totalPages: 1,
            page: 2,
            hasNext: false,
            hasPrev: false,
            limit: 20
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result = await eventSubmissionsService.getEventSubmissions(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/events-submissions',
        {
          show: '20',
          page: '2',
          search: 'Concert',
          type: 'new'
        },
        'Failed to fetch event submissions'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch event submissions with partial filters', async () => {
      const filters: EventSubmissionsFilters = {
        show: 10,
        page: 1
      };

      const mockResponse: EventSubmissionsResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          data: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 1,
            hasNext: false,
            hasPrev: false,
            limit: 10
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      await eventSubmissionsService.getEventSubmissions(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/events-submissions',
        {
          show: '10',
          page: '1'
        },
        'Failed to fetch event submissions'
      );
    });

    it('should handle error when fetching event submissions', async () => {
      const mockError = new Error('Network error');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(
        eventSubmissionsService.getEventSubmissions()
      ).rejects.toThrow('Network error');
    });
  });

  describe('getEventSubmissionDetail', () => {
    it('should successfully fetch event submission detail', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          id: 'submission-1',
          eventId: 'event-1',
          eventName: 'Test Event',
          status: 'pending',
          submittedAt: '2024-01-01'
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockResponse);

      const result =
        await eventSubmissionsService.getEventSubmissionDetail('submission-1');

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/events-submissions/submission-1',
        {},
        'Failed to fetch event submission detail'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when fetching submission detail', async () => {
      const mockError = new Error('Not found');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(
        eventSubmissionsService.getEventSubmissionDetail('invalid-id')
      ).rejects.toThrow('Not found');
    });
  });

  describe('approveOrRejectSubmission', () => {
    it('should successfully approve submission', async () => {
      const payload = {
        status: 'approved' as const,
        rejectedFields: [],
        rejectedReason: ''
      };

      const mockResponse = {
        statusCode: 200,
        message: 'Submission approved successfully',
        body: {
          id: 'submission-1',
          status: 'approved'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result =
        await eventSubmissionsService.approveOrRejectSubmission(
          'event-1',
          payload
        );

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/events-submissions/event-1/approval',
        payload,
        'Failed to submit approval decision'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should successfully reject submission with reasons', async () => {
      const payload = {
        status: 'rejected' as const,
        rejectedFields: ['eventName', 'eventDate'],
        rejectedReason: 'Invalid event details'
      };

      const mockResponse = {
        statusCode: 200,
        message: 'Submission rejected',
        body: {
          id: 'submission-1',
          status: 'rejected',
          rejectedFields: ['eventName', 'eventDate'],
          rejectedReason: 'Invalid event details'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result =
        await eventSubmissionsService.approveOrRejectSubmission(
          'event-1',
          payload
        );

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/events-submissions/event-1/approval',
        payload,
        'Failed to submit approval decision'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when submitting approval decision', async () => {
      const payload = {
        status: 'approved' as const,
        rejectedFields: [],
        rejectedReason: ''
      };

      const mockError = new Error('Submission failed');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(
        eventSubmissionsService.approveOrRejectSubmission('event-1', payload)
      ).rejects.toThrow('Submission failed');
    });
  });

  describe('approveOrRejectEvent', () => {
    it('should successfully approve event', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Event approved',
        body: {
          id: 'submission-1',
          status: 'approved'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await eventSubmissionsService.approveOrRejectEvent(
        'submission-1',
        'approved'
      );

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/events-submissions/submission-1/approval',
        { status: 'approved' },
        'Failed to submit approval decision'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should successfully reject event', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Event rejected',
        body: {
          id: 'submission-1',
          status: 'rejected'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await eventSubmissionsService.approveOrRejectEvent(
        'submission-1',
        'rejected'
      );

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/events-submissions/submission-1/approval',
        { status: 'rejected' },
        'Failed to submit approval decision'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when approving/rejecting event', async () => {
      const mockError = new Error('Action failed');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(
        eventSubmissionsService.approveOrRejectEvent('submission-1', 'approved')
      ).rejects.toThrow('Action failed');
    });
  });
});
