import { apiUtils } from '@/utils/apiUtils';

export interface DiscountInfo {
  discount: number;
  quota: number;
  max_order_quantity: number;
}

export interface CreatePartnerTicketTypeRequest {
  partner_id: string;
  ticket_type_ids: string[];
  discount: Record<string, DiscountInfo>;
  expired_at: string;
}

export interface Partner {
  id: string;
  event_organizer_id: string;
  partner_name: string;
  social_media_link: string;
  pic_name: string;
  pic_phone_number: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    ktpNumber: string;
    dateOfBirth: string;
    gender: string;
    isVerified: boolean;
    isGuest: boolean;
    role: {
      id: string;
      name: string;
    };
    profilePicture: {
      id: string;
      url: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface PartnerTicketType {
  id: string;
  partner_id: string;
  code: string;
  ticket_type_ids: string[];
  discount: Record<string, DiscountInfo>;
  expired_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  partner?: Partner;
}

export interface CreatePartnerTicketTypeResponse {
  status_code: number;
  message: string;
  body: PartnerTicketType;
}

export interface GetPartnerTicketTypesFilters {
  event_id: string;
  limit?: number;
  page?: number;
}

export interface GetPartnerTicketTypesResponse {
  status_code: number;
  message: string;
  body: {
    data: PartnerTicketType[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

class PartnerTicketTypesService {
  async createPartnerTicketType(
    data: CreatePartnerTicketTypeRequest
  ): Promise<CreatePartnerTicketTypeResponse> {
    try {
      return await apiUtils.post<CreatePartnerTicketTypeResponse>(
        '/api/partner-ticket-types',
        data,
        'Failed to create partner ticket type'
      );
    } catch (error) {
      console.error('Error creating partner ticket type:', error);
      throw error;
    }
  }

  async getPartnerTicketTypes(
    filters: GetPartnerTicketTypesFilters
  ): Promise<GetPartnerTicketTypesResponse> {
    try {
      const params: Record<string, any> = {
        event_id: filters.event_id
      };

      if (filters.limit !== undefined) {
        params.limit = filters.limit.toString();
      }
      if (filters.page !== undefined) {
        params.page = filters.page.toString();
      }

      return await apiUtils.get<GetPartnerTicketTypesResponse>(
        '/api/partner-ticket-types',
        params,
        'Failed to fetch partner ticket types'
      );
    } catch (error) {
      console.error('Error fetching partner ticket types:', error);
      throw error;
    }
  }
}

const partnerTicketTypesService = new PartnerTicketTypesService();

export { partnerTicketTypesService };

