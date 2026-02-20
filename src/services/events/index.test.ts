import {
  EventsResponse,
  EventDetailResponse,
  CreateEventRequest,
  CreateEventResponse,
  EventsFilters
} from '@/types/event';
import { apiUtils } from '@/utils/apiUtils';

import { eventsService } from './index';

// Mock apiUtils
jest.mock('@/utils/apiUtils', () => ({
  apiUtils: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('EventsService', () => {
  const mockApiUtilsGet = apiUtils.get as jest.MockedFunction<
    typeof apiUtils.get
  >;
  const mockApiUtilsPost = apiUtils.post as jest.MockedFunction<
    typeof apiUtils.post
  >;
  const mockApiUtilsPut = apiUtils.put as jest.MockedFunction<
    typeof apiUtils.put
  >;
  const mockApiUtilsDelete = apiUtils.delete as jest.MockedFunction<
    typeof apiUtils.delete
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should successfully fetch events without filters', async () => {
      const mockEventsResponse: EventsResponse = {
        message: 'Success',
        body: {
          data: [],
          eventCountByStatus: {
            draft: 0,
            approved: 0,
            onGoing: 0,
            onReview: 0,
            done: 0,
            rejected: 0,
          },
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

      mockApiUtilsGet.mockResolvedValue(mockEventsResponse);

      const result = await eventsService.getEvents();

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/events',
        {},
        'Failed to fetch events'
      );
      expect(result).toEqual(mockEventsResponse);
    });

    it('should fetch events with filters', async () => {
      const filters: EventsFilters = {
        show: 20,
        page: 2,
        name: 'Concert',
        cityId: 'city-1',
        status: 'published'
      };

      const mockEventsResponse: EventsResponse = {
        message: 'Success',
        body: {
          data: [],
          eventCountByStatus: {
            draft: 0,
            approved: 0,
            onGoing: 0,
            onReview: 0,
            done: 0,
            rejected: 0,
          },
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            page: 2,
            limit: 20,
            hasNext: false,
            hasPrev: false
          }
        }
      };

      mockApiUtilsGet.mockResolvedValue(mockEventsResponse);

      await eventsService.getEvents(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/events',
        expect.objectContaining({
          limit: '20',
          page: '2',
          name: 'Concert',
          cityId: 'city-1',
          status: 'published'
        }),
        'Failed to fetch events'
      );
    });

    it('should handle array of statuses', async () => {
      const filters: EventsFilters = {
        status: ['draft', 'published', 'cancelled']
      };

      mockApiUtilsGet.mockResolvedValue({} as any);

      await eventsService.getEvents(filters);

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/events',
        expect.objectContaining({
          'status[0]': 'draft',
          'status[1]': 'published',
          'status[2]': 'cancelled'
        }),
        'Failed to fetch events'
      );
    });

    it('should handle error when fetching events', async () => {
      const mockError = new Error('Network error');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(eventsService.getEvents()).rejects.toThrow('Network error');
    });
  });

  describe('getEventDetail', () => {
    it('should successfully fetch event detail', async () => {
      const mockDetailResponse: EventDetailResponse = {
        statusCode: 200,
        message: 'Success',
        body: {
          id: 'event-1',
          name: 'Test Event',
          metaUrl: 'test-event'
        } as any
      };

      mockApiUtilsGet.mockResolvedValue(mockDetailResponse);

      const result = await eventsService.getEventDetail('test-event');

      expect(mockApiUtilsGet).toHaveBeenCalledWith(
        '/api/events/test-event',
        {},
        'Failed to fetch event detail'
      );
      expect(result).toEqual(mockDetailResponse);
    });

    it('should handle error when fetching event detail', async () => {
      const mockError = new Error('Event not found');
      mockApiUtilsGet.mockRejectedValue(mockError);

      await expect(eventsService.getEventDetail('invalid-url')).rejects.toThrow(
        'Event not found'
      );
    });
  });

  describe('createEvent', () => {
    it('should successfully create an event', async () => {
      const mockEventData: CreateEventRequest = {
        name: 'New Event',
        eventTypeId: 'type-1',
        cityId: 'city-1'
      } as any;

      const mockCreateResponse: CreateEventResponse = {
        statusCode: 201,
        message: 'Event created successfully',
        body: {
          id: 'event-new',
          name: 'New Event'
        } as any
      };

      mockApiUtilsPost.mockResolvedValue(mockCreateResponse);

      const result = await eventsService.createEvent(mockEventData);

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/events/create',
        mockEventData,
        'Failed to create event'
      );
      expect(result).toEqual(mockCreateResponse);
    });

    it('should handle error when creating event', async () => {
      const mockEventData: CreateEventRequest = {
        name: 'Invalid Event'
      } as any;

      const mockError = new Error('Validation error');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(eventsService.createEvent(mockEventData)).rejects.toThrow(
        'Validation error'
      );
    });
  });

  describe('updateEventDetails', () => {
    it('should successfully update event details', async () => {
      const eventId = 'event-1';
      const mockUpdateData: CreateEventRequest = {
        name: 'Updated Event',
        eventTypeId: 'type-1'
      } as any;

      const mockUpdateResponse: EventDetailResponse = {
        statusCode: 200,
        message: 'Event updated successfully',
        body: {
          id: eventId,
          name: 'Updated Event'
        } as any
      };

      mockApiUtilsPut.mockResolvedValue(mockUpdateResponse);

      const result = await eventsService.updateEventDetails({
        eventId,
        data: mockUpdateData
      });

      expect(mockApiUtilsPut).toHaveBeenCalledWith(
        `/api/events/${eventId}/edit`,
        mockUpdateData,
        'Failed to update event'
      );
      expect(result).toEqual(mockUpdateResponse);
    });

    it('should handle error when updating event', async () => {
      const mockError = new Error('Update failed');
      mockApiUtilsPut.mockRejectedValue(mockError);

      await expect(
        eventsService.updateEventDetails({
          eventId: 'event-1',
          data: {} as any
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteEvent', () => {
    it('should successfully delete an event', async () => {
      mockApiUtilsDelete.mockResolvedValue(undefined);

      await eventsService.deleteEvent('event-1');

      expect(mockApiUtilsDelete).toHaveBeenCalledWith(
        '/api/events/event-1/delete',
        'Failed to delete event'
      );
    });

    it('should handle error when deleting event', async () => {
      const mockError = new Error('Delete failed');
      mockApiUtilsDelete.mockRejectedValue(mockError);

      await expect(eventsService.deleteEvent('event-1')).rejects.toThrow(
        'Delete failed'
      );
    });
  });

  describe('submitEvent', () => {
    it('should successfully submit an event', async () => {
      const mockResponse = {
        message: 'Event submitted successfully'
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await eventsService.submitEvent('event-1');

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/events/event-1/submission',
        {},
        'Failed to submit event'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when submitting event', async () => {
      const mockError = new Error('Submit failed');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(eventsService.submitEvent('event-1')).rejects.toThrow(
        'Submit failed'
      );
    });
  });

  describe('duplicateEvent', () => {
    it('should successfully duplicate an event', async () => {
      const mockResponse = {
        message: 'Event duplicated successfully',
        body: {
          id: 'event-duplicate'
        }
      };

      mockApiUtilsPost.mockResolvedValue(mockResponse);

      const result = await eventsService.duplicateEvent('event-1');

      expect(mockApiUtilsPost).toHaveBeenCalledWith(
        '/api/events/duplicate',
        { id: 'event-1' },
        'Failed to duplicate event'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle error when duplicating event', async () => {
      const mockError = new Error('Duplicate failed');
      mockApiUtilsPost.mockRejectedValue(mockError);

      await expect(eventsService.duplicateEvent('event-1')).rejects.toThrow(
        'Duplicate failed'
      );
    });
  });

  describe('Event Asset operations', () => {
    describe('createEventAsset', () => {
      it('should successfully create event asset', async () => {
        const mockData = {
          eventId: 'event-1',
          assetId: 'asset-1',
          order: 1
        };

        const mockResponse = {
          statusCode: 201,
          message: 'Asset created',
          body: {
            id: 'event-asset-1',
            ...mockData
          }
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await eventsService.createEventAsset(mockData);

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/events/event-asset',
          mockData,
          'Failed to create event asset'
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateEventAsset', () => {
      it('should successfully update event asset', async () => {
        const mockData = {
          eventId: 'event-1',
          assetId: 'asset-1',
          order: 2
        };

        const mockResponse = {
          message: 'Asset updated',
          body: {
            id: 'event-asset-1',
            ...mockData
          }
        };

        mockApiUtilsPut.mockResolvedValue(mockResponse);

        const result = await eventsService.updateEventAsset(
          'event-asset-1',
          mockData
        );

        expect(mockApiUtilsPut).toHaveBeenCalledWith(
          '/api/events/event-asset/event-asset-1',
          mockData,
          'Failed to update event asset'
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteEventAsset', () => {
      it('should successfully delete event asset', async () => {
        mockApiUtilsDelete.mockResolvedValue(undefined);

        await eventsService.deleteEventAsset('event-asset-1');

        expect(mockApiUtilsDelete).toHaveBeenCalledWith(
          '/api/events/event-asset/event-asset-1',
          'Failed to delete event asset'
        );
      });
    });
  });

  describe('Approval operations', () => {
    describe('approveOrRejectEventDetail', () => {
      it('should approve event detail', async () => {
        const mockPayload = {
          status: 'approved',
          rejectedFields: [],
          rejectedReason: ''
        };

        const mockResponse = {
          message: 'Event approved'
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await eventsService.approveOrRejectEventDetail(
          'event-1',
          mockPayload
        );

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/events/event-detail-approval/event-1',
          mockPayload,
          'Failed to process event detail'
        );
        expect(result).toEqual(mockResponse);
      });

      it('should reject event detail with reasons', async () => {
        const mockPayload = {
          status: 'rejected',
          rejectedFields: ['name', 'description'],
          rejectedReason: 'Invalid content'
        };

        const mockResponse = {
          message: 'Event rejected'
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        await eventsService.approveOrRejectEventDetail('event-1', mockPayload);

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/events/event-detail-approval/event-1',
          mockPayload,
          'Failed to process event detail'
        );
      });
    });

    describe('batchApproveAssets', () => {
      it('should approve all assets for an event', async () => {
        const mockResponse = {
          message: 'Assets approved'
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await eventsService.batchApproveAssets('event-1');

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/events/event-asset/approval',
          {
            eventId: 'event-1',
            status: 'approved',
            rejectedFields: [],
            rejectedReason: ''
          },
          'Failed to approve assets'
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('batchRejectAssets', () => {
      it('should reject specific assets with reason', async () => {
        const mockResponse = {
          message: 'Assets rejected'
        };

        mockApiUtilsPost.mockResolvedValue(mockResponse);

        const result = await eventsService.batchRejectAssets(
          'event-1',
          ['asset-1', 'asset-2'],
          'Poor quality'
        );

        expect(mockApiUtilsPost).toHaveBeenCalledWith(
          '/api/events/event-asset/approval',
          {
            eventId: 'event-1',
            status: 'rejected',
            rejectedFields: ['asset-1', 'asset-2'],
            rejectedReason: 'Poor quality'
          },
          'Failed to reject assets'
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
