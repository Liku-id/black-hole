import {
  EventDetailResponse,
  EventsFilters,
  EventsResponse,
  CreateEventRequest,
  CreateEventResponse
} from '@/types/event';
import { apiUtils } from '@/utils/apiUtils';

export interface CreateEventAssetRequest {
  eventId: string;
  assetId: string;
  order: number;
}

export interface CreateEventAssetResponse {
  statusCode: number;
  message: string;
  body: any;
}

export interface UpdateEventAssetRequest {
  eventId: string;
  assetId: string;
  order: number;
}

export interface UpdateEventAssetResponse {
  statusCode: number;
  message: string;
  body: any;
}

// Events Service
class EventsService {
  async getEvents(filters?: EventsFilters): Promise<EventsResponse> {
    try {
      const params: Record<string, any> = {};

      if (filters?.show) params.limit = filters.show.toString();
      if (filters?.page) params.page = filters.page.toString();
      if (filters?.name) params.name = filters.name;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      if (filters?.cityId) params.cityId = filters.cityId;
      if (filters?.event_organizer_id)
        params.event_organizer_id = filters.event_organizer_id;
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          filters.status.forEach((status, index) => {
            params[`status[${index}]`] = status;
          });
        } else {
          params.status = filters.status;
        }
      }

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

  async updateEvent({
    metaUrl,
    data
  }: {
    metaUrl: string;
    data: CreateEventRequest;
  }): Promise<EventDetailResponse> {
    try {
      return await apiUtils.put<EventDetailResponse>(
        `/api/events/${metaUrl}/edit`,
        { ...data },
        'Failed to update event'
      );
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Event Asset operations
  async createEventAsset(
    data: CreateEventAssetRequest
  ): Promise<CreateEventAssetResponse> {
    try {
      return await apiUtils.post<CreateEventAssetResponse>(
        '/api/events/event-asset',
        data,
        'Failed to create event asset'
      );
    } catch (error) {
      console.error('Error creating event asset:', error);
      throw error;
    }
  }

  async updateEventAsset(
    id: string,
    data: UpdateEventAssetRequest
  ): Promise<UpdateEventAssetResponse> {
    try {
      return await apiUtils.put<UpdateEventAssetResponse>(
        `/api/events/event-asset/${id}`,
        data,
        'Failed to update event asset'
      );
    } catch (error) {
      console.error('Error updating event asset:', error);
      throw error;
    }
  }

  async deleteEventAsset(id: string): Promise<void> {
    try {
      await apiUtils.delete(
        `/api/events/event-asset/${id}`,
        'Failed to delete event asset'
      );
    } catch (error) {
      console.error('Error deleting event asset:', error);
      throw error;
    }
  }

  async submitEvent(id: string): Promise<any> {
    try {
      return await apiUtils.post<any>(
        `/api/events/${id}/submission`,
        {},
        'Failed to submit event'
      );
    } catch (error) {
      console.error('Error submitting event:', error);
      throw error;
    }
  }

  async duplicateEvent(id: string): Promise<any> {
    try {
      return await apiUtils.post<any>(
        '/api/events/duplicate',
        { id },
        'Failed to duplicate event'
      );
    } catch (error) {
      console.error('Error duplicating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await apiUtils.delete(
        `/api/events/${id}/delete`,
        'Failed to delete event'
      );
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Event Detail Approval/Rejection
  async approveOrRejectEventDetail(
    eventId: string,
    payload: {
      rejectedFields?: string[];
      rejectedReason?: string;
      status: string;
    }
  ): Promise<any> {
    try {
      return await apiUtils.post<any>(
        `/api/events/event-detail-approval/${eventId}`,
        payload,
        'Failed to process event detail'
      );
    } catch (error) {
      console.error('Error processing event detail:', error);
      throw error;
    }
  }

  // Event Asset Approval/Rejection
  async batchApproveAssets(ids: string[]): Promise<any> {
    try {
      return await apiUtils.post<any>(
        '/api/events/event-asset/batch-approve',
        { ids },
        'Failed to approve assets'
      );
    } catch (error) {
      console.error('Error approving assets:', error);
      throw error;
    }
  }

  async batchRejectAssets(
    ids: string[],
    rejectedReason: string
  ): Promise<any> {
    try {
      return await apiUtils.post<any>(
        '/api/events/event-asset/batch-reject',
        {
          ids,
          rejectedFields: ids, // asset ids as rejected fields
          rejectedReason
        },
        'Failed to reject assets'
      );
    } catch (error) {
      console.error('Error rejecting assets:', error);
      throw error;
    }
  }
}

const eventsService = new EventsService();

export { eventsService };
