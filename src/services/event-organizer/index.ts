import { apiUtils } from '@/utils/apiUtils';
import { 
  EventOrganizer, 
  EventOrganizerMeResponse, 
  EventOrganizerStatisticsResponse,
  ListEventOrganizersRequest,
  ListEventOrganizersResponse 
} from '@/types/organizer';

export interface Bank {
  id: string;
  name: string;
  channelCode: string;
  channelType: string;
  minAmount: number;
  maxAmount: number;
}

export interface BanksResponse {
  banks: Bank[];
}

export interface UpdateGeneralPayload {
  name?: string;
  description?: string;
  social_media_url?: string;
  address?: string;
  asset_id?: string;
  organizer_type?: string;
}

export interface UpdateLegalPayload {
  npwp_photo_id?: string;
  npwp_number?: string;
  npwp_address?: string;
  ktp_photo_id?: string;
  ktp_number?: string;
  ktp_address?: string;
  full_name?: string;
  pic_name?: string;
  pic_title?: string;
}

export interface UpdateBankPayload {
  bank_id: string;
  account_number: string;
  account_holder_name: string;
}

export interface UpdateOrganizerTypePayload {
  organizer_type: 'individual' | 'institutional';
}

export const eventOrganizerService = {
  getEventOrganizerMe: async (): Promise<EventOrganizerMeResponse> => {
    const response = await apiUtils.get<EventOrganizerMeResponse>(
      '/api/event-organizers/me',
      {},
      'Failed to fetch event organizer'
    );
    return response;
  },

  updateEventOrganizerGeneral: async (
    eoId: string,
    payload: UpdateGeneralPayload
  ): Promise<EventOrganizer> => {
    const response = await apiUtils.post<EventOrganizer>(
      `/api/event-organizers/${eoId}/general`,
      payload,
      'Failed to update general information'
    );
    return response;
  },

  updateEventOrganizerLegal: async (
    eoId: string,
    payload: UpdateLegalPayload
  ): Promise<EventOrganizer> => {
    const response = await apiUtils.post<EventOrganizer>(
      `/api/event-organizers/${eoId}/legal`,
      payload,
      'Failed to update legal information'
    );
    return response;
  },

  updateEventOrganizerBank: async (
    eoId: string,
    payload: UpdateBankPayload
  ): Promise<EventOrganizer> => {
    const response = await apiUtils.post<EventOrganizer>(
      `/api/event-organizers/${eoId}/bank`,
      payload,
      'Failed to update bank information'
    );
    return response;
  },

  getBanks: async (): Promise<BanksResponse> => {
    const response = await apiUtils.get<BanksResponse>(
      '/api/banks',
      {},
      'Failed to fetch banks'
    );
    return response;
  },

  updateEventOrganizerType: async (
    eoId: string,
    payload: UpdateOrganizerTypePayload
  ): Promise<EventOrganizer> => {
    const response = await apiUtils.post<EventOrganizer>(
      `/api/event-organizers/${eoId}/type`,
      payload,
      'Failed to update organizer type'
    );
    return response;
  },

  getEventOrganizerStatistics: async (eventOrganizerId?: string): Promise<EventOrganizerStatisticsResponse> => {
    const params = eventOrganizerId ? { event_organizer_id: eventOrganizerId } : {};
    const response = await apiUtils.get<EventOrganizerStatisticsResponse>(
      '/api/event-organizers/statistics',
      params,
      'Failed to fetch event organizer statistics'
    );
    return response;
  },

  getAllEventOrganizers: async (
    params?: ListEventOrganizersRequest
  ): Promise<ListEventOrganizersResponse> => {
    // If no params provided, fetch all event organizers without pagination
    // If params.show is not provided, backend will return all event organizers
    const response = await apiUtils.get<ListEventOrganizersResponse>(
      '/api/organizers',
      params || {},
      'Failed to fetch event organizers'
    );
    return response;
  },

  getEventOrganizerById: async (
    eoId: string
  ): Promise<EventOrganizerMeResponse> => {
    const response = await apiUtils.get<EventOrganizerMeResponse>(
      `/api/event-organizers/${eoId}`,
      {},
      'Failed to fetch event organizer'
    );
    return response;
  }
};
