import {
  EventDetailResponse,
  EventsFilters,
  EventsResponse,
  CreateEventRequest,
  CreateEventResponse,
  InvitationListResponse,
  SendInvitationRequest,
  SendInvitationResponse,
  ResendInvitationResponse,
  SubmitEventResponse,
  DuplicateEventResponse,
  ApprovalResponse
} from '@/types/event';
import { apiUtils } from '@/utils/apiUtils';
import { TicketInvitationResponse } from '@/types/ticket';

export interface CreateEventAssetRequest {
  eventId: string;
  assetId: string;
  order: number;
}

export interface CreateEventAssetResponse {
  statusCode: number;
  message: string;
  body: {
    id: string;
    eventId: string;
    assetId: string;
    order: number;
  };
}

export interface UpdateEventAssetRequest {
  eventId: string;
  assetId: string;
  order: number;
}

export interface UpdateEventAssetResponse {
  statusCode: number;
  message: string;
  body: {
    id: string;
    eventId: string;
    assetId: string;
    order: number;
  };
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

  async updateEventDetails({
    eventId,
    data
  }: {
    eventId: string;
    data: CreateEventRequest;
  }): Promise<EventDetailResponse> {
    try {
      return await apiUtils.put<EventDetailResponse>(
        `/api/events/${eventId}/edit`,
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

  async submitEvent(id: string): Promise<SubmitEventResponse> {
    try {
      return await apiUtils.post<SubmitEventResponse>(
        `/api/events/${id}/submission`,
        {},
        'Failed to submit event'
      );
    } catch (error) {
      console.error('Error submitting event:', error);
      throw error;
    }
  }

  async duplicateEvent(id: string): Promise<DuplicateEventResponse> {
    try {
      return await apiUtils.post<DuplicateEventResponse>(
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
  ): Promise<ApprovalResponse> {
    try {
      return await apiUtils.post<ApprovalResponse>(
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
  async batchApproveAssets(eventId: string): Promise<ApprovalResponse> {
    try {
      return await apiUtils.post<ApprovalResponse>(
        '/api/events/event-asset/approval',
        {
          eventId,
          status: 'approved',
          rejectedFields: [],
          rejectedReason: ''
        },
        'Failed to approve assets'
      );
    } catch (error) {
      console.error('Error approving assets:', error);
      throw error;
    }
  }

  async batchRejectAssets(
    eventId: string,
    ids: string[],
    rejectedReason: string
  ): Promise<ApprovalResponse> {
    try {
      return await apiUtils.post<ApprovalResponse>(
        '/api/events/event-asset/approval',
        {
          eventId,
          status: 'rejected',
          rejectedFields: ids,
          rejectedReason
        },
        'Failed to reject assets'
      );
    } catch (error) {
      console.error('Error rejecting assets:', error);
      throw error;
    }
  }
  // Invitation Operations
  async getInvitations(
    eventId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      ticket_type_id?: string;
      status?: string;
    }
  ): Promise<InvitationListResponse> {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.search) queryParams.search = params.search;
      if (params?.ticket_type_id)
        queryParams.ticket_type_id = params.ticket_type_id;
      if (params?.status) queryParams.status = params.status;

      return await apiUtils.get(
        `/api/events/invitations/${eventId}`,
        queryParams,
        'Failed to fetch invitations'
      );
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  }

  async sendInvitations(
    eventId: string,
    data: SendInvitationRequest
  ): Promise<SendInvitationResponse> {
    try {
      return await apiUtils.post<SendInvitationResponse>(
        `/api/events/invitations/${eventId}`,
        data,
        'Failed to send invitations'
      );
    } catch (error) {
      console.error('Error sending invitations:', error);
      throw error;
    }
  }

  async resendInvitation(invitationId: string): Promise<ResendInvitationResponse> {
    try {
      return await apiUtils.post<ResendInvitationResponse>(
        `/api/ticket-invitations/${invitationId}/resend`,
        {},
        'Failed to resend invitation'
      );
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  }

  async getTicketInvitationsById(id: string): Promise<TicketInvitationResponse> {
    try {
      return await apiUtils.get(
        `/api/ticket-invitations/${id}`,
        {},
        'Failed to fetch ticket invitation'
      );
    } catch (error) {
      console.error('Error fetching ticket invitation:', error);
      throw error;
    } 
  }
}

const eventsService = new EventsService();

export { eventsService };
